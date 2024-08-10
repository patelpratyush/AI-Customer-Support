from langchain_community.document_loaders import UnstructuredPDFLoader, OnlinePDFLoader, WebBaseLoader, YoutubeLoader, DirectoryLoader, TextLoader, PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sklearn.metrics.pairwise import cosine_similarity
from langchain_pinecone import PineconeVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings
from pinecone import Pinecone
from openai import OpenAI
import numpy as np
from dotenv import load_dotenv
import tiktoken
import os

load_dotenv(dotenv_path='../../../.env.local')

class RAG:
    def __init__(self):
        # Initialize API keys
        self.pinecone_api_key = os.getenv('PINECONE_API_KEY')
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.openrouter_api_key = os.getenv('OPENROUTER_API_KEY')
        self.huggingface_api_token = os.getenv('HUGGINGFACE_API_TOKEN')
        self.user_agent = os.getenv('USER_AGENT')

        # Initialize clients and models
        self.embeddings = OpenAIEmbeddings()
        self.embeddings_model = "text-embedding-3-small"
        self.openai_client = OpenAI(
            api_key=self.openai_api_key, 
            default_headers={'User-Agent': self.user_agent})
        self.openrouter_client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=self.openrouter_api_key,
            default_headers={'User-Agent': self.user_agent}
        )

        # Initialize text splitter
        self.tokenizer = tiktoken.get_encoding('p50k_base')
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=2000,
            chunk_overlap=100,
            length_function=self.tiktoken_len,
            separators=["\n\n", "\n", " ", ""]
        )
        
        # Initialize Pinecone
        self.pinecone = Pinecone(api_key=self.pinecone_api_key, user_agent=self.user_agent)
        self.index_name = "code-assistant"
        self.namespace = "documentation"    
        self.vectorstore = None
        self.pinecone_index = self.pinecone.Index(self.index_name)
        
    def tiktoken_len(self, text):
        """Calculate the number of tokens in a text."""
        tokens = self.tokenizer.encode(text, disallowed_special=())
        return len(tokens)

    def get_embedding(self, text):
        """Get embedding for a given text using the OpenAI API."""
        response = self.openai_client.embeddings.create(input=text, model=self.embeddings_model)
        return response.data[0].embedding

    def cosine_similarity_between_words(self, word1, word2):
        """Calculate cosine similarity between embeddings of two words."""
        embedding1 = np.array(self.get_embedding(word1)).reshape(1, -1)
        embedding2 = np.array(self.get_embedding(word2)).reshape(1, -1)
        
        similarity = cosine_similarity(embedding1, embedding2)
        return similarity[0][0]

    def load_pdf(self, pdf_path):
        """Load data from a PDF file and split it into chunks."""
        loader = UnstructuredPDFLoader(pdf_path)
        data = loader.load()
        texts = self.text_splitter.split_documents(data)
        return texts

    def load_web_content(self, url):
        """Load data from a web page and split it into chunks."""
        loader = WebBaseLoader(url)
        data = loader.load()
        texts = self.text_splitter.split_documents(data)
        return texts

    def setup_vectorstore(self, texts):
        """Set up the Pinecone vector store with the given texts."""
        self.vectorstore = PineconeVectorStore.from_texts(
            [f"Source: {t.metadata['source']}, Title: {t.metadata['title']} \n\nContent: {t.page_content}" for t in texts],
            embedding=self.embeddings,
            index_name=self.index_name,
            namespace=self.namespace
        )

    def perform_rag(self, query, model):
        """Perform Retrieval-Augmented Generation using OpenAI."""
        query_embedding = self.get_embedding(query)
        
        top_matches = self.pinecone_index.query(
            vector=query_embedding,
            top_k=10,
            include_metadata=True,
            namespace=self.namespace
        )

        # Get the list of retrieved texts
        contexts = [item['metadata']['text'] for item in top_matches['matches']]
        
        augmented_query = "\n" + "\n\n-------\n\n".join(contexts[:10]) + "\n-------\n\n\n\n\nMY QUESTION:\n" + query
        
        # Modify the prompt below as needed to improve the response quality
        system_prompt = """You are an expert personal assistant. Answer any questions I have about the Youtube Video provided. You always answer questions based only on the context that you have been provided."""
        
        res = self.openrouter_client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": augmented_query}
            ]
        )
        
        return res.choices[0].message.content

def main(pdf_path=None, url=None):
    rag = RAG()

    if pdf_path:
        texts = rag.load_pdf(pdf_path)
    elif url:
        texts = rag.load_web_content(url)
    else:
        raise ValueError("Either pdf_path or url must be provided")
    
    rag.setup_vectorstore(texts)
    response = rag.perform_rag("What is the main topic discussed in the document?", "qwen/qwen-2-7b-instruct:free")
    print(response)

if __name__ == "__main__":
    main()
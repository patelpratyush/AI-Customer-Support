#!/bin/sh

# Check if a virtual environment exists
if [ -d "venv" ]; then
  echo "Activating virtual environment..."
  . venv/bin/activate
elif command -v conda &> /dev/null; then
  echo "Activating conda environment..."
  
  # Check if conda is initialized
  if ! grep -q "conda initialize" ~/.bashrc; then
    conda init
  fi
  
  conda activate chatbot3
else
  echo "No virtual environment found. Please create one using 'python -m venv venv' or 'conda create -n chatbot3 python=3.10.4'"
  exit 1
fi

# Run the Python script
python app/api/chat/app.py
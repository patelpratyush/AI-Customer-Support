if [ -d "venv" ]; then
  echo "Activating existing virtual environment..."
  . venv/bin/activate
else
  echo "Creating a new virtual environment..."
  python3 -m venv venv
  . venv/bin/activate
  
  echo "Installing requirements..."
  pip install --upgrade pip
  if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
  else
    echo "No requirements.txt found. Please provide a requirements file."
    exit 1
  fi
fi

# Run the Python script
python app/api/chat/app.py
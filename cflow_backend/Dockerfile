FROM python:3.10-slim

# Set environment variables (avoids Python buffering & .pyc files)
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    pkg-config \
    default-libmysqlclient-dev \
    netcat-openbsd \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container
COPY . /app/

# Activate start up script
RUN chmod +x /app/scripts/wait-on-db.sh


# Expose port 8000
EXPOSE 8000

# Run migrations and start the server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# Serverless Image Processing and Data Transformation Platform on AWS

## Overview
This project is a fully serverless image processing platform built on AWS.  
It automatically processes images upon upload, transforms them according to predefined specifications (resize + grayscale), and stores both the processed images and their metadata.

> Built using AWS Lambda, S3, DynamoDB, and Python (Pillow Library).

---

## Architecture Diagram
![Architecture Diagram](architecture/architecture-diagram.png)

---

## Core Components

### 1. Amazon S3 Buckets
- `image-input-geraldsadya`: Stores original uploaded images.
- `image-output-geraldsadya`: Stores processed images after transformation.

### 2. AWS Lambda Function
Python-based Lambda function that:
- Automatically triggers on new image upload to S3.
- Resizes images (max-width 1024px) while maintaining aspect ratio.
- Converts images to grayscale.
- Uploads processed images to output S3 bucket.
- Stores image metadata in DynamoDB.

### 3. DynamoDB
Table: `ProcessedImages`
- Partition Key: `ImageId`
- Metadata Stored:
    - Original & Processed Dimensions
    - File Sizes
    - Source & Output Bucket Info
    - Processing Timestamp

---

## Technologies Used

| Service | Purpose |
|---------|---------|
| AWS S3 | Object Storage (Input/Output Buckets) |
| AWS Lambda | Serverless Image Processor (Python) |
| DynamoDB | NoSQL Metadata Storage |
| AWS CloudWatch | Logging & Monitoring |
| Python | Backend Language (Pillow for Image Processing) |

---

## Folder Structure

```bash
aws-serverless-image-processor/
│
├── lambda/
│   ├── image_processor.py        # Lambda Function Code
│   └── requirements.txt          # Pillow & Boto3
│
├── architecture/
│   └── architecture-diagram.png  # System Diagram
│
├── screenshots/
│   ├── s3-buckets.png
│   ├── dynamodb.png
│   └── cloudwatch-logs.png
│
├── .gitignore
├── README.md
└── LICENSE (Optional)

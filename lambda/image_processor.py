import boto3
import json
import os
import time
import subprocess
import sys
import urllib.parse
from datetime import datetime

def lambda_handler(event, context):
    #Installing Pillow at runtime
    print("Installing Pillow...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "--target", "/tmp/"])
    sys.path.insert(0, "/tmp/")
    
    #importing Image after installing Pillow
    print("Importing PIL...")
    from io import BytesIO
    from PIL import Image
    
    print("Starting image processing...")
    print(f"Full event: {json.dumps(event)}")
    
    #Initializing AWS clients
    s3_client = boto3.client('s3')
    dynamodb = boto3.resource('dynamodb')
    
    OUTPUT_BUCKET = 'image-output-geraldsadya'
    TABLE_NAME = 'ProcessedImages'
    MAX_WIDTH = 1024
    
    try:
        #Getting the object from the event
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'])
        
        print(f"Processing image from bucket: {bucket}, key: {key}")
        
        print("Listing objects in the bucket:")
        response = s3_client.list_objects_v2(Bucket=bucket)
        if 'Contents' in response:
            for obj in response['Contents']:
                print(f"Found object: {obj['Key']}")
        else:
            print("No objects found in bucket")
        
        try:
            #Downloading the image from S3
            print(f"Attempting to download image from S3: {bucket}/{key}")
            response = s3_client.get_object(Bucket=bucket, Key=key)
            image_content = response['Body'].read()
            
            #Original image metadata
            original_size = len(image_content)
            print(f"Original image size: {original_size} bytes")
            
            print("Processing image...")
            with Image.open(BytesIO(image_content)) as image:
                original_width, original_height = image.size
                print(f"Original dimensions: {original_width}x{original_height}")
                
                #Resizing the image if width exceeds MAX_WIDTH
                if original_width > MAX_WIDTH:
                    ratio = MAX_WIDTH / original_width
                    new_height = int(original_height * ratio)
                    print(f"Resizing to {MAX_WIDTH}x{new_height}")
                    image = image.resize((MAX_WIDTH, new_height), Image.LANCZOS)
                
                #Converting to grayscale
                print("Converting to grayscale...")
                image = image.convert('L')
                
                #Saving processed image to memory
                buffer = BytesIO()
                save_format = image.format if image.format else 'JPEG'
                print(f"Saving as format: {save_format}")
                image.save(buffer, format=save_format)
                processed_image = buffer.getvalue()
                
                #Get image metadata
                processed_size = len(processed_image)
                processed_width, processed_height = image.size
                print(f"Processed image size: {processed_size} bytes")
                print(f"Processed dimensions: {processed_width}x{processed_height}")
                
                print(f"Uploading processed image to {OUTPUT_BUCKET}/{key}")
                try:
                    s3_client.put_object(
                        Bucket=OUTPUT_BUCKET,
                        Key=key,
                        Body=processed_image,
                        ContentType=response['ContentType']
                    )
                    print(f"Successfully uploaded to {OUTPUT_BUCKET}/{key}")
                except Exception as upload_error:
                    print(f"Error uploading to S3: {str(upload_error)}")
                    print(f"Error type: {type(upload_error).__name__}")
                    raise upload_error
                
                #Store metadata in DynamoDB
                try:
                    print(f"Storing metadata in DynamoDB table {TABLE_NAME}...")
                    table = dynamodb.Table(TABLE_NAME)
                    timestamp = datetime.now().isoformat()
                    
                    table.put_item(
                        Item={
                            'ImageId': key,
                            'OriginalBucket': bucket,
                            'OutputBucket': OUTPUT_BUCKET,
                            'OriginalSize': original_size,
                            'ProcessedSize': processed_size,
                            'OriginalDimensions': f"{original_width}x{original_height}",
                            'ProcessedDimensions': f"{processed_width}x{processed_height}",
                            'ProcessedAt': timestamp
                        }
                    )
                    print("Metadata stored successfully")
                except Exception as db_error:
                    print(f"Error writing to DynamoDB: {str(db_error)}")
                    print(f"Error type: {type(db_error).__name__}")
                
                print("Image processing completed successfully")
                return {
                    'statusCode': 200,
                    'body': json.dumps({
                        'message': 'Image processed successfully',
                        'original_bucket': bucket,
                        'output_bucket': OUTPUT_BUCKET,
                        'key': key
                    })
                }
                
        except Exception as process_error:
            print(f"Error processing image: {str(process_error)}")
            print(f"Error type: {type(process_error).__name__}")
            raise process_error
            
    except Exception as e:
        print(f"General error: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        raise e
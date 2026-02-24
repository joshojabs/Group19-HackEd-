import cv2
from pyzbar.pyzbar import decode

#--Guide--
#pass a file path into the function
#if no barcode is present, or it cannot be read, barcode will return none
#an example is at the bottom of the file


def BarcodeReader(image):
    
    # read the image in numpy array using cv2
    img = cv2.imread(image)
     
    # Decode the barcode image
    detectedBarcodes = decode(img)
     
    # If not detected then print the message
    if not detectedBarcodes:
        print("Barcode Not Detected or your barcode is blank/corrupted!")
    else:
      
          # Traverse through all the detected barcodes in image
        for barcode in detectedBarcodes:  
          
            # Locate the barcode position in image
            if barcode.data!="":
              
            # Print the barcode data
                return(barcode.data)                


if __name__ == "__main__":#example of how it works
  # Take the image from user
    image="haribow_far_2.jpg" #-need a file name for it to work
    data = BarcodeReader(image)
    print(data)
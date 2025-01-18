const fileUploadService = require('../services/fileUploadService');
const fs = require('fs');
const path = require('path');

async function testFileUploadService() {
  try {
    console.log('Starting file upload service tests...\n');

    // Create test files
    const testDir = path.join(__dirname, 'testFiles');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }

    // Create a test image file
    const imageFile = path.join(testDir, 'test-image.png');
    fs.writeFileSync(imageFile, 'Test image content');

    // Create a test PDF file
    const pdfFile = path.join(testDir, 'test-doc.pdf');
    fs.writeFileSync(pdfFile, 'Test PDF content');

    // Mock request and response objects
    const mockReq = {
      params: {
        type: 'leaves'
      },
      files: [
        {
          originalname: 'test-image.png',
          buffer: fs.readFileSync(imageFile),
          mimetype: 'image/png'
        },
        {
          originalname: 'test-doc.pdf',
          buffer: fs.readFileSync(pdfFile),
          mimetype: 'application/pdf'
        }
      ]
    };

    const mockRes = {
      status: (code) => ({
        json: (data) => console.log('Response:', data)
      })
    };

    // Test 1: Single file upload
    console.log('Testing single file upload...');
    const singleFileResult = await fileUploadService.uploadFile({
      ...mockReq,
      files: [mockReq.files[0]]
    }, mockRes);
    console.log('✓ Single file upload successful');
    console.log('File info:', singleFileResult, '\n');

    // Test 2: Multiple file upload
    console.log('Testing multiple file upload...');
    const multipleFileResult = await fileUploadService.uploadFiles(mockReq, mockRes);
    console.log('✓ Multiple file upload successful');
    console.log('Files info:', multipleFileResult, '\n');

    // Test 3: Get file info
    console.log('Testing get file info...');
    if (multipleFileResult && multipleFileResult.length > 0) {
      const fileInfo = await fileUploadService.getFileInfo(
        multipleFileResult[0].filename,
        'leaves'
      );
      console.log('✓ File info retrieved successfully');
      console.log('File info:', fileInfo, '\n');
    }

    // Test 4: Delete file
    console.log('Testing file deletion...');
    if (multipleFileResult && multipleFileResult.length > 0) {
      const deleteResult = await fileUploadService.deleteFile(
        multipleFileResult[0].filename,
        'leaves'
      );
      console.log('✓ File deleted successfully');
      console.log('Delete result:', deleteResult, '\n');
    }

    // Clean up test files
    console.log('Cleaning up test files...');
    fs.unlinkSync(imageFile);
    fs.unlinkSync(pdfFile);
    fs.rmdirSync(testDir);
    console.log('✓ Test files cleaned up\n');

    console.log('All file upload tests completed successfully! ✨\n');
  } catch (error) {
    console.error('Error during file upload testing:', error);
  }
}

// Run tests
testFileUploadService();

const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');

const asyncPipeline = promisify(pipeline);

const uploadFile = (req, res, next) => {
    const contentType = req.headers['content-type'];
    if (!(contentType) || !(contentType.includes('multipart/form-data'))){
        return next(new Error('Content-Type must be multipart/form-data'));
    }

    const boundary = contentType.split('boundary=')[1];
    if (!(boundary)){
        return next(new Error('the form data has no boundaries!'));
    }

    let body = Buffer.alloc(0);
    const sizeLimit = 2 * 1024 * 1024 // 2 MB = (2 * 2^(10) * 2^(10) bytes)

    req.on('data', (chunk) => {
        body = Buffer.concat([body, chunk]);
        
        if (body.length > sizeLimit){
            return next(new Error('File exceeds the size limit of 2 MB. Please try again.'));s
        }
    });

    req.on('end', async () => {
        try{ 
            const result = parseData(body, boundary) // break down the buffer's data and parse it in parts
            if (!result.file){
                return next(new Error("No file upload detected!"));
            }
            const types = ['image/jpeg', 'image/png'];
            if (!types.includes(result.file.mimetype)){
                return next(new Error("The uploaded filetype is not allowed. Please upload either a JPEG or a PNG file."));s
            }

            const timestamp = Date.now();
            const extn = path.extname(result.file.originalname);
            const fileName = `profile-${timestamp}${extension}`;
            const filePath = path.join(process.env.FILE_UPLOAD_PATH, fileName);

            const uploadDirectory = process.env.FILE_UPLOAD_PATH;
            if (!fs.existsSync(uploadDirectory)){
                fs.mkdirSync(uploadDirectory, {recursive: true});   
            }

            fs.writeFileSync(filePath, result.file.buffer);

            req.file = { // build the request object with the file information
                fieldname: result.file.fieldname,
                originalname: result.file.originalname, 
                encoding: result.file.encoding,
                mimetype: result.file.mimetype, 
                destination: uploadDirectory, 
                filename: fileName, 
                path: filePath, 
                size: result.file.buffer.length
            };

            req.body = result.fields; // add in the data from the other fields as well (non-file data)

            next();


        }

        catch(err){
            next(err);
        }

    });

    req.on('error', (error) => {
        next(error);
    });
};

function parseData(buffer, boundary) { // helper function to break down the data and metadata from the request object 

    const bufferBoundary = Buffer.from(`--${boundary}`);
    const parts = [];
    let startIndex = 0; // to loop through the buffer object

    while (true){
        const boundaryIndex = buffer.indexOf(bufferBoundary, startIndex);
        if (boundaryIndex == -1) break;

        if (startIndex != 0){
            parts.push(buffer.slice(start, boundaryIndex));
        }

        startIndex = boundaryIndex + bufferBoundary.length; 
    }

    const result = { fields : {}, file: null};

    parts.forEach(part => {

        if (part.length == 0) return; 
        const headerEndIndex = part.indexOf('\r\n\r\n');
        if (headerEndIndex == -1) return;

        const headers = part.slice(0, headerEndIndex).toString()
        const content = part.slice(headerEndIndex + 4); // right after the last 'new line'

        const validDisposition = headers.match(/Content-Disposition: form-data; name="([^"]+)"(?:; filename="([^"]+)")?/);
        if (!validDisposition) return;
 
        fieldName = validDisposition[1];
        fileName = validDisposition[2];

        if (fileName) { 
            const validContentType = headers.match(/Content-Type: (.+)/);
            const mimetype = validContentType ? validContentType[1].trim() : 'application/octet-stream';

            result.file = {
                fieldname: fieldName, 
                originalname: fileName, 
                mimetype: mimetype,
                encoding: '7bit',
                buffer: content.slice(0, -2) // trim trailing control character sequence
            };
        }
        else {
            result.fields[fieldName] = content.slice(0, -2).toString();
        }

    });

    return result; 

}
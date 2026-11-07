const MAX_FILE_SIZE = 10 * 1024 * 1024;

function checkFileSize(file) {
  return Boolean(file && file.size <= MAX_FILE_SIZE);
}

export default checkFileSize;

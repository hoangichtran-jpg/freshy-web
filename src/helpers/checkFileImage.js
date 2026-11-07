function checkMagicNumber(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided."));

      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const array = new Uint8Array(reader.result).subarray(0, 4);

      let header = "";

      for (let index = 0; index < array.length; index += 1) {
        header += array[index].toString(16).padStart(2, "0");
      }

      const valid =
        header === "89504e47" ||
        header === "ffd8ffe0" ||
        header === "ffd8ffe1" ||
        header === "ffd8ffe2" ||
        header === "47494638";

      resolve(valid);
    };

    reader.onerror = () => {
      reject(new Error("Could not read the file."));
    };

    reader.readAsArrayBuffer(file.slice(0, 4));
  });
}

export default checkMagicNumber;

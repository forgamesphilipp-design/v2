export function selectPhotoFromCamera(): Promise<File> {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment"; // 👉 erzwingt Kamera auf Mobile
  
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) reject(new Error("No photo selected"));
        else resolve(file);
      };
  
      input.click();
    });
  }
  
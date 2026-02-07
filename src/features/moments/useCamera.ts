export async function takePhoto(): Promise<File> {
    // Mobile & moderne Browser
    if ("mediaDevices" in navigator && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
  
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();
  
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
  
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0);
  
      stream.getTracks().forEach((t) => t.stop());
  
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.9)
      );
  
      return new File([blob], "moment.jpg", { type: "image/jpeg" });
    }
  
    // Fallback (Desktop)
    return new Promise<File>((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = () => {
        if (!input.files?.[0]) reject(new Error("No file selected"));
        else resolve(input.files[0]);
      };
      input.click();
    });
  }
  
const webpInput = document.getElementById('webp-input');
const convertBtn = document.getElementById('convert-btn');
const jpgOutput = document.getElementById('jpg-output');
const downloadLink = document.getElementById('download-link');

convertBtn.addEventListener('click', () => {
    const file = webpInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const jpgDataUrl = canvas.toDataURL('image/jpeg');
                jpgOutput.src = jpgDataUrl;
                jpgOutput.style.display = 'block';
                downloadLink.href = jpgDataUrl;
                downloadLink.download = 'converted.jpg';
                downloadLink.style.display = 'block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});
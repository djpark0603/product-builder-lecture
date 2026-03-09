const webpInput = document.getElementById('webp-input');
const folderInput = document.getElementById('folder-input');
const convertBtn = document.getElementById('convert-btn');
const fileList = document.getElementById('file-list');
const actionButtons = document.getElementById('action-buttons');
const downloadAllBtn = document.getElementById('download-all-btn');

let filesToProcess = [];
let convertedFiles = [];

function updateFileList() {
    fileList.innerHTML = '';
    filesToProcess.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
            <span class="file-name">${file.name}</span>
            <span class="file-status status-pending" id="status-${index}">Pending</span>
        `;
        fileList.appendChild(item);
    });
    
    convertBtn.disabled = filesToProcess.length === 0;
    actionButtons.style.display = 'none';
}

webpInput.addEventListener('change', (e) => {
    filesToProcess = Array.from(e.target.files);
    updateFileList();
});

folderInput.addEventListener('change', (e) => {
    filesToProcess = Array.from(e.target.files).filter(file => file.type === 'image/webp' || file.name.endsWith('.webp'));
    updateFileList();
});

async function convertFile(file, index) {
    const statusEl = document.getElementById(`status-${index}`);
    statusEl.textContent = 'Converting...';
    statusEl.className = 'file-status status-converting';

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
                        statusEl.textContent = 'Done';
                        statusEl.className = 'file-status status-done';
                        resolve({ blob, name: newName });
                    } else {
                        statusEl.textContent = 'Error';
                        statusEl.className = 'file-status status-error';
                        reject(new Error('Canvas toBlob failed'));
                    }
                }, 'image/jpeg', 0.9);
            };
            img.onerror = () => {
                statusEl.textContent = 'Error';
                statusEl.className = 'file-status status-error';
                reject(new Error('Image load failed'));
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            statusEl.textContent = 'Error';
            statusEl.className = 'file-status status-error';
            reject(new Error('File read failed'));
        };
        reader.readAsDataURL(file);
    });
}

convertBtn.addEventListener('click', async () => {
    if (filesToProcess.length === 0) return;

    convertBtn.disabled = true;
    convertedFiles = [];

    for (let i = 0; i < filesToProcess.length; i++) {
        try {
            const result = await convertFile(filesToProcess[i], i);
            convertedFiles.push(result);
        } catch (error) {
            console.error(`Failed to convert file ${i}:`, error);
        }
    }

    if (convertedFiles.length > 0) {
        actionButtons.style.display = 'block';
    }
    convertBtn.disabled = false;
});

downloadAllBtn.addEventListener('click', async () => {
    if (convertedFiles.length === 0) return;

    const zip = new JSZip();
    convertedFiles.forEach(file => {
        zip.file(file.name, file.blob);
    });

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = "converted_images.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});
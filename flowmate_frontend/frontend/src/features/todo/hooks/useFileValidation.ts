import { useState } from 'react';

const MAX_FILE_COUNT = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024;

export function useFileValidation() {
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    function validateFiles(files: FileList | File[], existingCount: number = 0) {
        const fileArray = Array.from(files);

        if (fileArray.length + existingCount > MAX_FILE_COUNT) {
            setAlertMessage(`파일은 최대 ${MAX_FILE_COUNT}개까지 업로드 가능합니다.`);
            return false;
        }
        let totalSize = 0;
        for (const file of fileArray) {
            if (file.size > MAX_FILE_SIZE) {
                setAlertMessage(`파일 하나의 크기는 최대 10MB입니다. (${file.name})`);
                return false;
            }
            totalSize += file.size;
        }
        if (totalSize > MAX_TOTAL_SIZE) {
            setAlertMessage('파일 총 용량은 50MB를 초과할 수 없습니다.');
            return false;
        }
        return true;
    }

    return { alertMessage, setAlertMessage, validateFiles };
}
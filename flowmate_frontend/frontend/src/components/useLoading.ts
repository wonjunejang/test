import { useState } from "react";

export const useLoading = () => {
    const [isLoading, setIsLoading] = useState(false);

    // withLoading: 비동기 함수를 받아서 로딩 상태를 자동으로 관리
    const withLoading = async (fn: () => Promise<void>) => {
        setIsLoading(true);
        try {
            await fn();
        } finally {
            setIsLoading(false); // 성공/실패 상관없이 로딩 종료
        }
    };

    return { isLoading, withLoading };
};
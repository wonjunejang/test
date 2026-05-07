import { useState, useCallback, type ChangeEvent } from 'react';

/**
 * @param initialValue 
 */
export const useInput = (initialValue: string = "") => {
const [value, setValue] = useState(initialValue);

// 1. 변화를 감지하는 핸들러 (이벤트 객체를 직접 다룸)
const onChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
setValue(e.target.value);
}, []);

// 2. 값을 강제로 변경해야 할 때 (예: 외부에서 주입)
const updateValue = useCallback((newValue: string) => {
setValue(newValue);
}, []);

// 3. 입력값을 초기화할 때
const reset = useCallback(() => {
setValue(initialValue);
}, [initialValue]);

    return {
    value,
    onChange,
    setValue: updateValue,
    reset
    };
};

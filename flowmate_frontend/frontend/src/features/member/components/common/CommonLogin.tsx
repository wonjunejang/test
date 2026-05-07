import { useInput } from "../../hooks/useInput";

export default function CommonLogin({}) {
    const useInputValue = useInput("");
    return (
        <input
            type="text"
            className="form-control form-control-lg py-3 mb-3"
            placeholder="아이디"
            value={useInputValue.value}
            onChange={useInputValue.onChange}
            style={{ fontSize: '1rem', borderRadius: '10px' }}
        />
    );
}
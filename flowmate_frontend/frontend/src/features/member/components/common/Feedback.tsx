interface FeedbackProps {
    status: string | null;
    okMsg: string;
}

export default function Feedback({ status, okMsg }: FeedbackProps) {
    if (!status) return null;

    return (
        <div className={`small mt-1 ms-1 ${status === "ok" ? "text-success" : "text-danger"}`}>
            {status === "ok" ? okMsg : status}
        </div>
    );
}
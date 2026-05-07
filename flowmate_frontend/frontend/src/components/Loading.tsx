 
export default function Loading() {
    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center gap-3"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.45)", zIndex: 9999 }}
        >
            <div
                className="spinner-border text-light"
                style={{ width: "48px", height: "48px" }}
                role="status"
            >
                <span className="visually-hidden">Loading...</span>
            </div>
            <span className="text-white small">잠시만 기다려주세요.</span>
        </div>
    );
}
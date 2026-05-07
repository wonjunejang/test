import React from 'react';

export default function LoadingOverlay() {
    return (
    <div 
        className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center bg-white bg-opacity-75" 
        style={{ zIndex: 9999 }}
    >
      {/* 부트스트랩 기본 스피너 */}
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Loading...</span>
        </div>
    
      {/* 로딩 텍스트 */}
        <h5 className="mt-3 fw-bold text-secondary">
        잠시만 기다려주세요...
        </h5>
    </div>
    );
};
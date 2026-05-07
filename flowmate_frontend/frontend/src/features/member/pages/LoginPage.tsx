// LoginPage.tsx
import React, { useEffect, useState } from 'react';
import { type Member } from '../memberType';
import { useLogin } from '../hooks/useLogin';
import useMemberStore from '../store/useMemberStore';
import LoadingOverlay from '../components/LoadingOverlay';
import ShowPassword from '../components/ShowPassword';
import { usePasswordToggle } from '../hooks/usePasswordToggle';
import { Link, useNavigate } from 'react-router-dom';
import Loading from '../../../components/Loading';
import { useLoading } from '../../../components/useLoading';
import { getMyProjects } from '../../../lib/projectApi';

import useAlertStore from '../store/useAlertStore';
import AlertModal from '../../../components/AlertModal';

export default function LoginPage() {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isVisible, toggle] = usePasswordToggle();
    const { login } = useLogin();
    const { isLoading, withLoading } = useLoading();
    const nav = useNavigate();
    const memberInfo = useMemberStore(state => state.memberInfo);
    const { isOpen, message, onConfirm, close } = useAlertStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const payLoad: Member = {
            username: username,
            password: password
        };
        withLoading(async () => {
            await login(payLoad);
        });
    };

    const _hasHydrated = useMemberStore((state) => state._hasHydrated);

    useEffect(() => {
        if (!_hasHydrated) return;
        if (memberInfo == null) return;

        const redirect = async () => {
            try {
                const res = await getMyProjects();
                const projects = res.data;
                if (!projects || projects.length === 0) {
                    nav("/projects/0");
                } else {
                    const maxId = Math.max(...projects.map(p => p.projectId));
                    nav(`/projects/${maxId}`);
                }
            } catch {
                nav("/projects/0");
            }
        };
        redirect();
    }, [_hasHydrated, memberInfo]);

    if (!_hasHydrated) return <LoadingOverlay />;

    return (
        <>
            {isLoading && <Loading />}
            {isOpen && (
                <AlertModal
                    message={message}
                    onConfirm={() => {
                        onConfirm?.();
                        close();
                    }}
                />
            )}
            <div className="container d-flex justify-content-center align-items-center">
                <div className="w-100" style={{ maxWidth: '400px' }}>
                    <form onSubmit={handleLogin} className="text-center">
                        <h1 className="fw-bold mb-5" style={{ color: '#333' }}>로그인</h1>
                        <div className="mb-2">
                            <input
                                type="text"
                                className="form-control form-control-lg py-3 mb-3"
                                placeholder="아이디"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ fontSize: '1rem', borderRadius: '10px' }}
                            />
                            <div className="position-relative">
                                <input
                                    type={isVisible ? 'text' : 'password'}
                                    className="form-control form-control-lg py-3"
                                    placeholder="비밀번호"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ fontSize: '1rem', borderRadius: '10px' }}
                                />
                                <ShowPassword isVisible={isVisible} toggleVisible={toggle} />
                            </div>
                        </div>
                        <div className="d-flex justify-content-end find">
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                <Link to="findmemberid" className="text-decoration-none text-secondary">아이디 찾기</Link>
                                <Link to="findmemberpassword" className="text-decoration-none text-secondary">비밀번호 찾기</Link>
                            </div>
                        </div>
                        <div className="d-grid gap-3 mb-4">
                            <button
                                type="submit"
                                className="btn btn-dark py-3 fw-bold action"
                                style={{ backgroundColor: '#333', borderRadius: '12px', border: 'none' }}
                            >
                                로그인
                            </button>
                            <Link
                                to="/sign"
                                className="btn py-3 fw-bold action"
                                style={{ backgroundColor: '#eaeaea', color: '#333', borderRadius: '12px', border: 'none' }}
                            >
                                회원가입
                            </Link>
                        </div>
                        <Link to="/accountrecovery" className="text-secondary text-decoration-underline" style={{ fontSize: '0.85rem' }}>
                            계정복구
                        </Link>
                    </form>
                </div>
            </div>
        </>
    );
}
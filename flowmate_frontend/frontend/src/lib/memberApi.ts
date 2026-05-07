import type { Member } from '../features/member/memberType';
import axios from 'axios';
import { axiosInstance } from './axios';

const BASE_URL = import.meta.env.VITE_API_URL;

// Authorization 옵션은 없을 수도 있으니 파라미터로 다시 만들 생각하기 !
export const memberPostRequest = async (payLoad : Member, path : string, auth : Object | null) => {
    const endpoint : string = BASE_URL + path;
    console.log(endpoint);
    let response;
    if(auth == null) {
        response = await axios.post(endpoint, payLoad);
    }else{
        response = await axios.post(endpoint, payLoad, auth);
    }
    
    return response;
}


// get방식

export const memberGetRequest = async (path : string) => {
    const endPoint = BASE_URL + path;
    const response = await axios.get(endPoint);
    return response;
}


export const memberPostRequestInstance = async (payLoad: Member, path: string, auth: Object | null = null) => {
    // 인스턴스를 사용해 post 요청 수행
    // auth가 null이면 두 번째 인자(payload)만 보내고, 있으면 세 번째 인자로 설정을 합침
    const response = await axiosInstance.post(path, payLoad, auth || {});
    
    return response;
};
import eyeHide  from "../../../assets/eye_hide.png";
import eyeShow from "../../../assets/eye_show.png";
import type { Visible } from "../memberType";



export default function ShowPassword({isVisible, toggleVisible} : Visible)  {

    return(
        <>       
        <button
        type="button"
        className="btn position-absolute top-50 end-0 translate-middle-y border-0 shadow-none "
        onClick={toggleVisible} 
        style={{ marginRight: '10px' }}>
        {isVisible ? <img src={eyeShow} style={{ width: '20px', height: '20px' }}/> :  <img src={eyeHide} style={{ width: '20px', height: '20px' }}/>}
    </button>
    </>
    );

}
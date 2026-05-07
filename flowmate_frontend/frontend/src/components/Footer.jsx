import './master.css';

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <nav className="footer-nav">
          <ul>
            <li><a>회사소개</a></li>
            <li><a>서비스 소개</a></li>
            <li><a>이용약관</a></li>
            <li><a>개인정보 처리방침</a></li>
            <li><a>고객센터</a></li>
          </ul>
        </nav>

        <div className="footer-info">
          <ul>
            <li>FlowMate</li>
            <li>Team.FlowMate</li>
            <li>고객센터 0000-0000 (09:00~17:00 / 주말 및 공휴일 휴무)</li>
            <li>사업자등록번호 000-00-00000</li>
          </ul>
          
        </div>
        
        <p className="footer-copy">Copyright© FlowMate (주) All rights reserved.</p>

      </div>
    </footer>
  );
}

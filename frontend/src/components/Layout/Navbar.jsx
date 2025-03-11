import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom"; // Sử dụng useLocation để kiểm tra URL
import { navItems } from "../../static/data";
import styles from "../../styles/styles";

const Navbar = () => {
  const location = useLocation(); // Lấy URL hiện tại
  const [active, setActive] = useState(0);

  useEffect(() => {
    // Check for active state based on URL change
    const currentIndex = navItems.findIndex((item) => item.url === location.pathname);
    if (currentIndex !== -1) {
      setActive(currentIndex); // Set active state based on URL
    }
  }, [location.pathname]); // Effect will run on pathname change

  const handleActive = (index) => {
    setActive(index); // Cập nhật trạng thái active
  };

  return (
    <div className={`block 800px:${styles.noramlFlex}`}>
      {navItems && navItems.length > 0 ? (
        navItems.map((i, index) => (
          <div className="flex" key={index}>
            <Link
              to={i.url}
              className={`${active === index || location.pathname === i.url // Kiểm tra trạng thái active hoặc URL
                ? "text-[#17dd1f]"
                : "text-black 800px:text-[#fff]"
                } pb-[30px] 800px:pb-0 font-[500] px-6 cursor-pointer`}
              onClick={() => handleActive(index)} // Gán trạng thái active khi nhấn
            >
              {i.title}
            </Link>
          </div>
        ))
      ) : (
        <div>Không có mục nào</div>
      )}
    </div>
  );
};

export default Navbar;
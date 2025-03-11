import React from "react";
import { Link } from "react-router-dom";
import styles from "../../../styles/styles";

const Hero = () => {
  return (
    <div
      className={`relative min-h-[65vh] 700px:min-h-[65vh] w-[full] ${styles.noramlFlex}`}
      style={{
        backgroundImage:
          "url(https://res.cloudinary.com/dqfrzmavu/image/upload/v1733918534/irnb3ndiundd08lwxx1c.jpg)",
        backgroundSize: "cover", // Đảm bảo hình ảnh phủ đầy vùng chứa
        backgroundPosition: "center", // Hình ảnh căn giữa theo chiều ngang và dọc
        backgroundRepeat: "no-repeat", // Tránh lặp lại hình ảnh
      }}
    >
      <div className={`${styles.section} w-[90%] 800px:w-[60%]`}>
        <h1
          className={`text-[35px] leading-[1.2] 800px:text-[60px] font-[600] capitalize`}
          style={{
            color: "#ffffff", // White text for contrast
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)", // Subtle shadow for better readability
          }}
        >
          Chào Mừng Các Bạn Đến Với Chúng Tôi <br />
        </h1>
        <p
          className="pt-5 text-[20px] font-[Poppins] font-[400]"
          style={{
            color: "#f0f0f0",
            textShadow: "2px 2px 5px rgba(0, 0, 0, 5.0)",
          }}
        >
          Chúng tôi cung cấp cả sản phẩm chất lượng giúp chăm sóc sức khỏe và cải thiện của sống
          <br /> Khám phá ngay những sản phẩm an toàn và hiệu quả, đồng hành cùng bạn trên hành trình sống khỏe mỗi ngày{" "}
          <br />
        </p>
        <Link to="/products" className="inline-block">
          <div className={`${styles.button} mt-5`}>
            <span className="text-[#fff] font-[Poppins] text-[18px]">Mua</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Hero;
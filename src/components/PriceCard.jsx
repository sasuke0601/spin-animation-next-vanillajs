import Image from "next/image";
import styles from "./PriceCard.module.css";

const PriceCard = ({
  centerIndex,
  title,
  image,
  id,
  index,
  winnerIndex,
  reset,
  isSpinEnd,
}) => {
  const isEnd = winnerIndex !== -1;
  const isWinner = winnerIndex === index;
  const isCenter = centerIndex === index;

  return (
    <div
      className={styles.card}
      // style={{
      //   transition: "transform 2.5s",
      //   transform: `scale(${isWinner ? 1.5 : 1})`,
      //   zIndex: isWinner ? 10 : 1,
      //   filter: `blur(${isEnd ? (isWinner ? 0 : 6) : 0}px)`,
      // }}
      style={{
        transition: "transform 2.5s",
        opacity: isEnd ? 0 : 1,
        zIndex: isWinner ? 10 : 1,
      }}
    >
      <p style={{ color: isCenter ? "red" : "black" }}>id:{id}</p>
      <p style={{ color: isCenter ? "red" : "black" }}>{title}</p>
      <Image src={image} width={60} height={60} alt="" />
      {isWinner && isSpinEnd && <button onClick={reset}>back</button>}
    </div>
  );
};

export default PriceCard;

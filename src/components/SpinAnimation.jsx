import React, { useEffect, useMemo, useRef, useState } from "react";
import { cards } from "./config";
import styles from "./SpinAnimation.module.css";
import PriceCard from "./PriceCard";
import useWindowSize from "@/hooks/useWindowSize";
import Image from "next/image";

const CARD_WIDTH = 122;
const CARD_GAP = 0;
const TEMP_CARDS_LENGTH = 88;
const DURATION = 8000; // 8s

export default function SpinAnimation() {
  const spinRef = useRef(null);
  const { width } = useWindowSize();
  const [targetIndex, setTargetInex] = useState(5);
  const originCards = cards;

  const [lootoxImage, setLootboxImage] = useState(
    "/images/Brohalla_LootBOX_GIF.gif"
  );

  const [isResValues, setIsResValues] = useState(false);
  const [rewardToken, setRewardToken] = useState("");
  const [rewardValue, setRewardValue] = useState("");

  // get center position from cards and width
  const centerPoint = useMemo(() => {
    return width / 2;
  }, [width]);

  const [showCards, setShowCards] = useState([]);

  useEffect(() => {
    setShowCards(
      Array.from(
        { length: TEMP_CARDS_LENGTH },
        () => originCards[Math.floor(Math.random() * cards.length)]
      )
    );
  }, [cards]);

  const [target, setTarget] = useState(0);
  const [winnerIndex, setWinnerIndex] = useState(-1);
  const [isSpinEnd, setIsSpinEnd] = useState(false);
  const [centerIndex, setCenterIndex] = useState(-1);
  const [audio, setAudio] = useState(null);
  const [isMuted, setIsMuted] = useState(false); // Track mute status

  useEffect(() => {
    if (audio) {
      audio.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (audio == undefined || audio == null) setAudio(new Audio("./tick.mp3"));
  }, [audio]);

  useEffect(() => {
    const newAudio = new Audio("./tick.mp3");
    newAudio.addEventListener("error", () => {
      setAudio(null);
    });
    setAudio(newAudio);
    return () => {
      newAudio.removeEventListener("error", () => {
        setAudio(null);
      });
      newAudio.pause();
    };
  }, []);

  const handleSpin = () => {
    if (targetIndex > cards.length || targetIndex < 1) {
      alert("invaid target index");
      return;
    }

    const delta = Math.floor(centerPoint / CARD_WIDTH);
    const duration = DURATION;
    const startTime = performance.now();
    const startValue = target * CARD_WIDTH;
    const endValue = 50 * (CARD_WIDTH + CARD_GAP);
    const newCards = showCards.map((c, i) => {
      if (i === 50 + delta) {
        return originCards[targetIndex - 1];
      } else {
        return c;
      }
    });

    setShowCards(newCards);
    console.log(newCards);
    let prevCardIndex = 0;
    const updateTargetValue = () => {
      const currentTime = performance.now();
      const elapsedTime = currentTime - startTime;
      if (elapsedTime >= duration) {
        setTarget(endValue);
        setCenterIndex(Math.floor((endValue + centerPoint) / CARD_WIDTH));
        setWinnerIndex(50 + delta);
        setIsSpinEnd(true);
        handleLoobox();
        if (audio && !isMuted) {
          playsound();
        }
      } else {
        const t = elapsedTime / duration;
        const easing = 1 - Math.pow(1 - t, 5); // Cubic easing function
        const newValue = startValue + (endValue - startValue) * easing;
        setTarget(newValue);
        setCenterIndex(Math.floor((newValue + centerPoint) / CARD_WIDTH));
        if (
          prevCardIndex != Math.floor((newValue + centerPoint) / CARD_WIDTH)
        ) {
          if (!isMuted) {
            playsound(); // Play audio using cloneNode()
          }
          prevCardIndex = Math.floor((newValue + centerPoint) / CARD_WIDTH);
        }
        setTimeout(updateTargetValue, 16); // Update every 16ms (~60fps)
      }
    };
    updateTargetValue();
  };

  // Function to play audio using cloneNode()
  function playsound() {
    const newAudio = audio.cloneNode();
    newAudio.play();
  }

  const reset = () => {
    setTarget(0);
    setWinnerIndex(-1);
    setIsSpinEnd(false);
    setIsResValues(false);
  };

  const toggleMute = () => {
    setIsMuted(prevMute => !prevMute);
  };

  const handleLoobox = () => {
    setLootboxImage("/images/Brohalla_LootBOX_GIF.gif");
    setTimeout(() => {
      setIsResValues(true);
    }, 1000);
  };

  return (
    <main className={styles["main-box"]}>
      <div className={styles["spin-box"]}>
        {!isSpinEnd && <div className={styles["center-line"]} />}
        <div className="">
          <div
            className={styles["box-content"]}
            ref={spinRef}
            style={{
              transition: `all 16ms`,
              transform: `translateX(-${target}px)`, // target is moved position of cards' row
            }}
          >
            {showCards.map((item, index) => (
              <PriceCard
                key={index}
                title={item.title}
                image={item.image}
                id={item.id}
                index={index}
                winnerIndex={winnerIndex}
                centerIndex={centerIndex}
                reset={reset}
                isSpinEnd={isSpinEnd}
              />
            ))}
          </div>
          <div className={styles["demo-control"]}>
            <div
              className={
                styles["lootbox"] + " " + styles[isSpinEnd ? "loobox-open" : ""]
              }
            >
              <Image
                src={lootoxImage}
                width={400}
                height={400}
                className={styles["boxImage"]}
                alt=""
              />
              <div className={styles["show-item"]}>
                <div
                  className={
                    styles["show-values"] +
                    " " +
                    styles[isResValues ? "isResValues" : ""]
                  }
                >
                  {winnerIndex !== -1 && (
                    <>
                      <p>{showCards[winnerIndex].title}</p>
                      <div className="">
                        <Image
                          src={showCards[winnerIndex].image}
                          width={80}
                          height={80}
                          alt=""
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              <button className={styles["btn-back"]} onClick={reset}>
                Back
              </button>
            </div>
            {!isSpinEnd && (
              <div className={styles["panel"]}>
                <input
                  value={targetIndex}
                  onChange={e => setTargetInex(e.target.value)}
                  placeholder="Input target card index"
                  min={1}
                  max={7}
                  type="number"
                />
                <button
                  className={styles["spin-btn"]}
                  onClick={() => {
                    handleSpin();
                    setAudio();
                  }}
                >
                  Spin
                </button>
                <button className={styles["spin-btn"]} onClick={reset}>
                  RESET
                </button>
              </div>
            )}
          </div>
          <div className={styles["sound-control"]}>
            <button className={styles["sound-btn"]} onClick={toggleMute}>
              {isMuted ? "Unmute" : "Mute"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

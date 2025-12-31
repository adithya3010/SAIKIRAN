"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./HeroCreative.module.css";
import Image from "next/image";
import Link from "next/link";

export default function HeroCreative() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        setMousePosition({ x, y });
    };

    const handleMouseLeave = () => {
        setMousePosition({ x: 0, y: 0 });
    };

    // Calculate rotation based on mouse position
    const rotateX = mousePosition.y * 10; // Max 5 degrees
    const rotateY = mousePosition.x * -10; // Max 5 degrees

    return (
        <section className={styles.heroSection} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} ref={containerRef}>
            <div className={styles.backgroundGrid}></div>
            <div className={styles.brandWatermark}></div>

            <div className={styles.contentWrapper}>
                <div className={styles.textContent}>

                    <h1 className={styles.headline}>
                        WEAR THE <br />
                        <span className={styles.highlight}>REVOLUTION</span>
                    </h1>
                    <p className={styles.subheadline}>
                        Redefining streetwear with bold cuts and futuristic aesthetics.
                        Designed for those who dare to stand out in the neon haze.
                    </p>
                    <div className={styles.ctaGroup}>
                        <Link href="/shop" className={styles.primaryButton}>
                            Shop Now
                        </Link>
                        <Link href="/collections/featured" className={styles.secondaryButton}>
                            View Lookbook
                        </Link>
                    </div>
                </div>

                <div className={styles.imageWrapper}>
                    <div className={styles.glow}></div>
                    <div
                        style={{
                            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
                            transition: 'transform 0.1s ease-out'
                        }}
                    >
                        <Image
                            src="/hero-creative.png"
                            alt="Streetwear Model"
                            width={800}
                            height={800}
                            className={styles.heroImage}
                            priority
                            quality={100}
                            unoptimized
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

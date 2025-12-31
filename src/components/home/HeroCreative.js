"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./HeroCreative.module.css";
import Image from "next/image";
import Link from "next/link";

export default function HeroCreative() {
    const containerRef = useRef(null);

    // Calculate rotation based on mouse position
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;

        // Mouse gives us -0.5 to 0.5
        // Map to -10 to 10 degrees
        setRotateX(y * 20);
        setRotateY(x * -20);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    // Mobile Gyroscope Effect
    useEffect(() => {
        const handleOrientation = (e) => {
            const { beta, gamma } = e;
            if (beta === null || gamma === null) return;

            // beta: front-to-back [-180, 180]
            // gamma: left-to-right [-90, 90]

            // Calibrate 'zero' to a standard holding angle of 45 degrees
            // Sensitivity multiplier: 1.5x for more visible effect
            const pitch = beta - 45;
            const roll = gamma;

            // Clamp max tilt to prevent extreme flipping
            const MAX_TILT = 20;

            const x = Math.min(Math.max(pitch, -MAX_TILT), MAX_TILT);
            const y = Math.min(Math.max(roll, -MAX_TILT), MAX_TILT);

            // Apply to state with some smoothing/multiplier
            // Inverting X (pitch) usually feels more natural (tilt phone away = look up/down)
            setRotateX(x * -1.5);
            setRotateY(y * 1.5);
        };

        // Try to add listener immediately (works for Android/Desktop)
        window.addEventListener('deviceorientation', handleOrientation);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, []);

    // iOS requires explicit user permission for sensors
    const handleInteraction = () => {
        if (typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        // Listener will be active from useEffect, if not, re-add here
                    }
                })
                .catch(console.error);
        }
    };

    return (
        <section
            className={styles.heroSection}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleInteraction} // Capture click for iOS permission
            ref={containerRef}
        >
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

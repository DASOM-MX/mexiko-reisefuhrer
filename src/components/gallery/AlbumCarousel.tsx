import { useCallback, useEffect, useRef, useState } from "react";
import {
	animate,
	motion,
	useMotionValue,
	useMotionValueEvent,
	useReducedMotion,
	useTransform,
	type MotionValue,
	type PanInfo,
} from "motion/react";
import type { AlbumCarouselProps, CarouselAlbum } from "./types";
import "./AlbumCarousel.css";

/** Tunables per breakpoint (<640, <1024, else); same key order as the original. */
interface Cfg {
	distanceDivisor: number;
	velocityDivisor: number;
	sensitivity: number;
	xMultiplier: number;
	yMultiplier: number;
	rotationMultiplier: number;
	scaleReduction: number;
	reduced: boolean;
}
const CONFIGS = [
	{ distanceDivisor: 120, velocityDivisor: 500, sensitivity: 180, xMultiplier: 90, yMultiplier: 20, rotationMultiplier: 8, scaleReduction: 0.06 },
	{ distanceDivisor: 160, velocityDivisor: 650, sensitivity: 220, xMultiplier: 130, yMultiplier: 30, rotationMultiplier: 10, scaleReduction: 0.09 },
	{ distanceDivisor: 200, velocityDivisor: 800, sensitivity: 250, xMultiplier: 170, yMultiplier: 40, rotationMultiplier: 12, scaleReduction: 0.12 },
];
const pickCfg = (w: number, reduced: boolean): Cfg => ({
	...(w < 640 ? CONFIGS[0] : w < 1024 ? CONFIGS[1] : CONFIGS[2]),
	reduced,
});

const SPRING = { type: "spring", stiffness: 200, damping: 30, mass: 1 } as const;
const MOVE_THRESHOLD = 6; // px of pointer travel after which a click becomes a drag
const CYCLE_MS = 1200;

interface CardProps {
	album: CarouselAlbum;
	index: number;
	total: number;
	wrap: boolean;
	progress: MotionValue<number>;
	cfg: MotionValue<Cfg>;
	isFront: boolean;
	near: boolean;
	autoPlay: boolean;
	reduced: boolean;
	onActivate: (e: React.MouseEvent, index: number) => void;
}

function Card({ album, index, total, wrap, progress, cfg, isFront, near, autoPlay, reduced, onActivate }: CardProps) {
	// Signed distance from the front. With wrapping it is folded into [-total/2, total/2].
	const offset = useTransform(() => {
		const raw = index - progress.get();
		return wrap ? ((((raw + total / 2) % total) + total) % total) - total / 2 : raw;
	});
	const abs = useTransform(() => Math.abs(offset.get()));
	const x = useTransform(() => offset.get() * cfg.get().xMultiplier);
	const y = useTransform(() => abs.get() * cfg.get().yMultiplier);
	const rotate = useTransform(() => {
		const c = cfg.get();
		return c.reduced || abs.get() < 0.05 ? 0 : offset.get() * c.rotationMultiplier;
	});
	const scale = useTransform(() => 1 - abs.get() * cfg.get().scaleReduction);
	// Fade out at the far edge of the ring (or beyond 2.5 steps when not wrapping).
	const t = wrap ? total : 5;
	const opacity = useTransform(offset, [-t / 2, -t / 2 + 0.5, 0, t / 2 - 0.5, t / 2], [0, 1, 1, 1, 0]);
	const zIndex = useTransform(() => Math.round(100 - abs.get() * 10));
	const dim = useTransform(offset, [-2, -0.5, 0, 0.5, 2], [0.5, 0.2, 0, 0.2, 0.5]);
	const titleOpacity = useTransform(offset, [-0.5, 0, 0.5], [0, 1, 0]);

	// Hover / focus preview: step 0 = cover, 1..n = previews.
	const [hovered, setHovered] = useState(false);
	const [step, setStep] = useState(0);
	const imgs = [album.cover, ...album.previews.slice(0, 3)];
	const n = imgs.length - 1;
	const playing = !reduced && n > 0 && isFront && (hovered || autoPlay);
	useEffect(() => {
		if (!playing) {
			setStep(0);
			return;
		}
		setStep(1);
		if (n < 2) return;
		const id = setInterval(() => setStep((s) => (s % n) + 1), CYCLE_MS);
		return () => clearInterval(id);
	}, [playing, n]);

	return (
		<motion.div className="alb-card" style={{ x, y, rotate, scale, opacity, zIndex }}>
			<a
				className="alb-link"
				href={album.href}
				draggable={false}
				aria-label={album.title}
				aria-hidden={near ? undefined : true}
				tabIndex={near ? 0 : -1}
				onClick={(e) => onActivate(e, index)}
				onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
				onPointerLeave={() => setHovered(false)}
				onFocus={() => setHovered(true)}
				onBlur={() => setHovered(false)}
			>
				{imgs.map((img, i) => (
					<img
						key={i}
						className="alb-img"
						src={img.src}
						alt=""
						draggable={false}
						decoding="async"
						loading={i === 0 && index < 3 ? "eager" : "lazy"}
						style={{ opacity: i === step ? 1 : 0 }}
					/>
				))}
				<motion.span className="alb-dim" style={{ opacity: dim }} />
				<span className="alb-grad" />
				<motion.span className="alb-title" style={{ opacity: titleOpacity }}>
					{album.title}
				</motion.span>
			</a>
		</motion.div>
	);
}

export default function AlbumCarousel({ albums, labels }: AlbumCarouselProps) {
	const total = albums.length;
	const wrap = total >= 4;
	const reducedPref = useReducedMotion() ?? false;
	const [width, setWidth] = useState(0); // 0 on server and first paint => mobile config
	const [hoverNone, setHoverNone] = useState(false);
	const [front, setFront] = useState(0);
	const [settled, setSettled] = useState(true);

	const progress = useMotionValue(0);
	const cfg = useMotionValue<Cfg>(pickCfg(0, false));
	const startRef = useRef(0);
	const movedRef = useRef(false);
	const animRef = useRef<ReturnType<typeof animate> | null>(null);
	const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	useEffect(() => {
		const onResize = () => setWidth(window.innerWidth);
		onResize();
		window.addEventListener("resize", onResize, { passive: true });
		const mq = window.matchMedia("(hover: none)");
		const onMq = () => setHoverNone(mq.matches);
		onMq();
		mq.addEventListener("change", onMq);
		return () => {
			window.removeEventListener("resize", onResize);
			mq.removeEventListener("change", onMq);
			clearTimeout(settleTimer.current);
		};
	}, []);
	useEffect(() => cfg.set(pickCfg(width, reducedPref)), [width, reducedPref, cfg]);

	const clamp = useCallback((v: number) => (wrap ? v : Math.min(Math.max(v, 0), total - 1)), [wrap, total]);

	// Track which card is in front (for a11y, hover and the live region) and when motion has settled.
	useMotionValueEvent(progress, "change", (v) => {
		const f = ((Math.round(v) % total) + total) % total;
		setFront(f);
		setSettled(false);
		clearTimeout(settleTimer.current);
		settleTimer.current = setTimeout(() => setSettled(true), 700);
	});

	const goTo = useCallback(
		(target: number) => {
			animRef.current?.stop();
			const to = clamp(target);
			if (reducedPref) progress.set(to);
			else animRef.current = animate(progress, to, SPRING);
		},
		[clamp, reducedPref, progress],
	);
	const step = (d: number) => goTo(Math.round(progress.get()) + d);

	const onPanStart = () => {
		animRef.current?.stop();
		startRef.current = progress.get();
		movedRef.current = false;
	};
	const onPan = (_: PointerEvent, info: PanInfo) => {
		if (Math.abs(info.offset.x) > MOVE_THRESHOLD) movedRef.current = true;
		progress.set(clamp(progress.get() - info.delta.x / cfg.get().sensitivity));
	};
	const onPanEnd = (_: PointerEvent, info: PanInfo) => {
		const c = cfg.get();
		// Throw: distance dragged plus fling velocity, converted to whole cards (max 3).
		const shift = Math.max(-3, Math.min(3, Math.round(-info.offset.x / c.distanceDivisor - info.velocity.x / c.velocityDivisor)));
		goTo(Math.round(startRef.current) + shift);
	};

	// Capture phase: a drag must never end in a navigation.
	const onClickCapture = (e: React.MouseEvent) => {
		if (movedRef.current) {
			e.preventDefault();
			e.stopPropagation();
			movedRef.current = false;
		}
	};
	// Clicking a side card brings it to the front instead of navigating.
	const onActivate = (e: React.MouseEvent, index: number) => {
		const raw = index - progress.get();
		const o = wrap ? ((((raw + total / 2) % total) + total) % total) - total / 2 : raw;
		if (Math.abs(o) >= 0.5) {
			e.preventDefault();
			goTo(Math.round(progress.get() + o));
		}
	};
	const onKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowLeft") (e.preventDefault(), step(-1));
		else if (e.key === "ArrowRight") (e.preventDefault(), step(1));
	};

	if (total === 0) return null;
	const dist = (i: number) => {
		const d = Math.abs(i - front);
		return wrap ? Math.min(d, total - d) : d;
	};

	return (
		<section className="alb-root" aria-roledescription="carousel" aria-label={labels.region}>
			<motion.div
				className="alb-stage"
				onPanStart={onPanStart}
				onPan={onPan}
				onPanEnd={onPanEnd}
				// A pure click never fires onPanStart, so reset the drag flag on every press;
				// otherwise a drag released outside the stage would swallow the next click.
				onPointerDownCapture={() => (movedRef.current = false)}
				onClickCapture={onClickCapture}
				onKeyDown={onKeyDown}
			>
				{albums.map((album, i) => (
					<Card
						key={album.href}
						album={album}
						index={i}
						total={total}
						wrap={wrap}
						progress={progress}
						cfg={cfg}
						isFront={i === front}
						near={dist(i) <= 1}
						autoPlay={hoverNone && settled}
						reduced={reducedPref}
						onActivate={onActivate}
					/>
				))}
			</motion.div>
			{total > 1 && (
				<div className="alb-controls">
					<button type="button" className="alb-btn" aria-label={labels.prev} onClick={() => step(-1)}>
						<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
					</button>
					<button type="button" className="alb-btn" aria-label={labels.next} onClick={() => step(1)}>
						<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
					</button>
				</div>
			)}
			<p className="alb-sr" aria-live="polite" aria-atomic="true">
				{`${albums[front]?.title ?? ""} (${front + 1} / ${total})`}
			</p>
		</section>
	);
}

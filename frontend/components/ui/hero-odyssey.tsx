"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

interface ElasticHueSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

function ElasticHueSlider({
  value,
  onChange,
  min = 0,
  max = 360,
  step = 1,
  label = "Adjust hue",
}: ElasticHueSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const progress = (value - min) / (max - min);
  const thumbPosition = progress * 100;

  return (
    <div className="relative flex w-full max-w-xs flex-col items-center sm:scale-90">
      {label ? (
        <label htmlFor="hue-slider-native" className="mb-1 text-sm text-slate-400">
          {label}
        </label>
      ) : null}
      <div className="relative flex h-5 w-full items-center">
        <input
          id="hue-slider-native"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute inset-0 z-20 h-full w-full cursor-pointer appearance-none bg-transparent"
          style={{ WebkitAppearance: "none" }}
        />
        <div className="absolute left-0 z-0 h-1 w-full rounded-full bg-slate-800" />
        <div
          className="absolute left-0 z-10 h-1 rounded-full bg-cyan-400/80"
          style={{ width: `${thumbPosition}%` }}
        />
        <motion.div
          className="absolute top-1/2 z-30 -translate-y-1/2"
          style={{ left: `${thumbPosition}%`, x: "-50%" }}
          animate={{ scale: isDragging ? 1.2 : 1 }}
          transition={{ type: "spring", stiffness: 500, damping: isDragging ? 20 : 30 }}
        >
          <div className="h-3 w-3 rounded-full border border-white/40 bg-white/90 shadow-md shadow-cyan-500/30" />
        </motion.div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2 }}
          className="mt-2 text-xs text-slate-500"
        >
          {value}°
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface FeatureItemProps {
  name: string;
  value: string;
  position: string;
}

interface LightningProps {
  hue?: number;
  xOffset?: number;
  speed?: number;
  intensity?: number;
  size?: number;
}

function Lightning({ hue = 230, xOffset = 0, speed = 1, intensity = 1, size = 1 }: LightningProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w > 0 && h > 0) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.warn("WebGL not supported; lightning background disabled.");
      return () => window.removeEventListener("resize", resizeCanvas);
    }

    const vertexShaderSource = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform float uHue;
      uniform float uXOffset;
      uniform float uSpeed;
      uniform float uIntensity;
      uniform float uSize;
      #define OCTAVE_COUNT 10

      vec3 hsv2rgb(vec3 c) {
          vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
          return c.z * mix(vec3(1.0), rgb, c.y);
      }

      float hash11(float p) {
          p = fract(p * .1031);
          p *= p + 33.33;
          p *= p + p;
          return fract(p);
      }

      float hash12(vec2 p) {
          vec3 p3 = fract(vec3(p.xyx) * .1031);
          p3 += dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
      }

      mat2 rotate2d(float theta) {
          float c = cos(theta);
          float s = sin(theta);
          return mat2(c, -s, s, c);
      }

      float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 fp = fract(p);
          float a = hash12(ip);
          float b = hash12(ip + vec2(1.0, 0.0));
          float c = hash12(ip + vec2(0.0, 1.0));
          float d = hash12(ip + vec2(1.0, 1.0));
          vec2 t = smoothstep(0.0, 1.0, fp);
          return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
      }

      float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < OCTAVE_COUNT; ++i) {
              value += amplitude * noise(p);
              p *= rotate2d(0.45);
              p *= 2.0;
              amplitude *= 0.5;
          }
          return value;
      }

      void mainImage(out vec4 fragColor, in vec2 fragCoord) {
          vec2 uv = fragCoord / iResolution.xy;
          uv = 2.0 * uv - 1.0;
          uv.x *= iResolution.x / iResolution.y;
          uv.x += uXOffset;
          uv += 2.0 * fbm(uv * uSize + 0.8 * iTime * uSpeed) - 1.0;
          float dist = abs(uv.x);
          vec3 baseColor = hsv2rgb(vec3(uHue / 360.0, 0.7, 0.8));
          vec3 col = baseColor * pow(mix(0.0, 0.07, hash11(iTime * uSpeed)) / dist, 1.0) * uIntensity;
          col = pow(col, vec3(1.0));
          fragColor = vec4(col, 1.0);
      }

      void main() {
          mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;

    const compileShader = (source: string, type: number): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return () => window.removeEventListener("resize", resizeCanvas);

    const program = gl.createProgram();
    if (!program) return () => window.removeEventListener("resize", resizeCanvas);
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program));
      return () => window.removeEventListener("resize", resizeCanvas);
    }
    gl.useProgram(program);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const iResolutionLocation = gl.getUniformLocation(program, "iResolution");
    const iTimeLocation = gl.getUniformLocation(program, "iTime");
    const uHueLocation = gl.getUniformLocation(program, "uHue");
    const uXOffsetLocation = gl.getUniformLocation(program, "uXOffset");
    const uSpeedLocation = gl.getUniformLocation(program, "uSpeed");
    const uIntensityLocation = gl.getUniformLocation(program, "uIntensity");
    const uSizeLocation = gl.getUniformLocation(program, "uSize");

    const startTime = performance.now();
    let raf = 0;
    let stopped = false;

    const render = () => {
      if (stopped) return;
      resizeCanvas();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (iResolutionLocation) gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
      const currentTime = performance.now();
      if (iTimeLocation) gl.uniform1f(iTimeLocation, (currentTime - startTime) / 1000.0);
      if (uHueLocation) gl.uniform1f(uHueLocation, hue);
      if (uXOffsetLocation) gl.uniform1f(uXOffsetLocation, xOffset);
      if (uSpeedLocation) gl.uniform1f(uSpeedLocation, speed);
      if (uIntensityLocation) gl.uniform1f(uIntensityLocation, intensity);
      if (uSizeLocation) gl.uniform1f(uSizeLocation, size);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resizeCanvas);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      if (vertexBuffer) gl.deleteBuffer(vertexBuffer);
    };
  }, [hue, xOffset, speed, intensity, size]);

  return <canvas ref={canvasRef} className="relative h-full w-full" aria-hidden />;
}

function FeatureItem({ name, value, position }: FeatureItemProps) {
  return (
    <div className={`group absolute ${position} z-10 transition-all duration-300 hover:scale-105`}>
      <div className="relative flex items-center gap-2">
        <div className="relative">
          <div className="h-2 w-2 rounded-full bg-white group-hover:animate-pulse" />
          <div className="absolute -inset-1 rounded-full bg-white/20 blur-sm opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
        <div className="relative text-white">
          <div className="font-medium transition-colors duration-300 group-hover:text-white">{name}</div>
          <div className="text-sm text-white/70 transition-colors duration-300 group-hover:text-white/80">{value}</div>
          <div className="absolute -inset-2 -z-10 rounded-lg bg-white/10 opacity-70 blur-md transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const [lightningHue, setLightningHue] = useState(175);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.22,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.55,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-black text-white"
    >
      <div className="relative z-20 mx-auto flex min-h-[min(100dvh,900px)] max-w-7xl flex-col px-4 pb-16 pt-6 sm:px-6 sm:pb-20 lg:px-8 lg:pb-28">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="pointer-events-none relative w-full"
        >
          <motion.div variants={itemVariants}>
            <FeatureItem name="Zama FHE" value="Encrypted parameters" position="left-0 top-36 sm:left-6 sm:top-44" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureItem name="Chainlink" value="ETH / USD oracle" position="left-[12%] top-28 sm:left-1/4 sm:top-32" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureItem name="Sepolia" value="Live demo network" position="right-[12%] top-28 sm:right-1/4 sm:top-32" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureItem name="WebGL" value="Procedural lightning" position="right-0 top-36 sm:right-6 sm:top-44" />
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-30 mx-auto flex max-w-4xl flex-col items-center text-center [&>*]:pointer-events-auto"
        >
          <ElasticHueSlider
            value={lightningHue}
            onChange={setLightningHue}
            label="Adjust lightning hue"
          />

          <motion.div variants={itemVariants} className="pointer-events-auto mb-6 mt-4">
            <Link
              href="/app"
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/10"
            >
              Open app — Sepolia
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden
              >
                <path
                  d="M8 3L13 8L8 13M13 8H3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </motion.div>

          <motion.h1 variants={itemVariants} className="mb-2 text-4xl font-light tracking-tight md:text-6xl lg:text-7xl">
            CipherPerps
          </motion.h1>

          <motion.h2
            variants={itemVariants}
            className="bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text pb-3 text-2xl font-light text-transparent md:text-4xl lg:text-5xl"
          >
            Confidential perpetuals
          </motion.h2>

          <motion.p variants={itemVariants} className="mb-10 max-w-2xl text-slate-400">
            ETH/USDC perpetuals with position size & leverage built for encryption (Zama FHE). Oracle-driven pricing,
            liquidation-aware MVP on Sepolia.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app"
              className="rounded-full bg-cyan-400 px-8 py-3 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Trade now
            </Link>
            <a
              href="https://sepolia.etherscan.io/address/0xFe97B52dC4219979e5524D244B8D8C0A39879B5F"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium backdrop-blur-sm hover:bg-white/10"
            >
              View contracts
            </a>
            <Link
              href="/#why"
              className="rounded-full px-6 py-3 text-sm text-slate-300 hover:text-white"
            >
              Why CipherPerps
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-black/82" />

        <div className="absolute left-1/2 top-[58%] h-[min(800px,90vw)] w-[min(800px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-cyan-500/15 to-fuchsia-600/10 blur-3xl" />

        <div className="absolute left-1/2 top-0 h-full w-full max-w-[100vw] -translate-x-1/2">
          <Lightning hue={lightningHue} xOffset={0} speed={1.6} intensity={0.55} size={2} />
        </div>

        <div className="absolute left-1/2 top-[58%] z-[1] h-[min(560px,75vw)] w-[min(560px,75vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_25%_90%,rgb(22,101,154)_14%,rgba(0,0,0,0.55)_72%,rgba(0,0,0,0.95)_100%)] backdrop-blur-3xl" />
      </motion.div>
    </section>
  );
}

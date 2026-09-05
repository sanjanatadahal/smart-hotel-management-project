import { useEffect, useRef } from "react";
import QRCode from "qrcode";

function QRCodeDisplay({ value, size = 160, title }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      const textToEncode = typeof value === "object" ? JSON.stringify(value) : String(value);
      QRCode.toCanvas(
        canvasRef.current,
        textToEncode,
        {
          width: size,
          margin: 2,
          color: {
            dark: "#2c1d11",
            light: "#ffffff",
          },
        },
        (error) => {
          if (error) console.error("QR Code Generation Error:", error);
        }
      );
    }
  }, [value, size]);

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", background: "#fff", padding: "12px", borderRadius: "10px", border: "1px solid #e2d9cf", boxShadow: "0 4px 14px rgba(0,0,0,0.06)" }}>
      <canvas ref={canvasRef} style={{ display: "block", borderRadius: "6px" }} />
      {title && (
        <span style={{ marginTop: "8px", fontSize: "11px", fontWeight: "600", color: "#6b5443", letterSpacing: "1px", textTransform: "uppercase" }}>
          {title}
        </span>
      )}
    </div>
  );
}

export default QRCodeDisplay;

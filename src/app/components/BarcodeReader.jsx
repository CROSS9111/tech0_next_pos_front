'use client'
import React, { useState, useEffect, useRef } from "react";
import { useZxing } from "react-zxing";

// react-zxing docs
// https://www.npmjs.com/package/react-zxing
// https://qiita.com/kurab/items/405da90f56cef8bf0c64

export default function BarcodeReader ({ onScan }) {
  const [barcodeError, setbarcodeError] = useState(null);
  const [lastScans, setLastScans] = useState([]); // 最後の3回のスキャン結果を追跡するための状態
  const [decodedText, setDecodedText] = useState("");
  const [count,setCount] = useState(0);

  const { ref } = useZxing({
    // エラー情報取得
    onError(error){
      setbarcodeError(error)
      console.log(barcodeError)
    },
    // スキャン結果取得
    onDecodeResult(result) { 
      const newDecodedText = result.getText(); 
      const updatedScans = [...lastScans, newDecodedText].slice(-3);
      setLastScans(updatedScans);

      // わかりやすいようにScan回数をカウント
      setCount(currentCount => currentCount + 1)
      console.log(count)

      // 3回同じバーコードがスキャンされた場合のみonScan関数を呼び出す
      if (
        updatedScans.length === 3 &&
        updatedScans.every(code => code === newDecodedText)
      ){
        onScan(decodedText)
        setCount(0)
      }
      // setDecodedText(result.getText());
      
    }})


  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {barcodeError && <p  className="text-red-500">{barcodeError}</p>}
      {/* スキャンする画面を表示する */}
      <div className="flex flex-col items-center">
        <video ref={ref} className="border-4 border-gray-400" />
        <p>
          <span>Last result:</span>
          <span>{lastScans}</span>
        </p>
        <p>カメラをバーコードに向けてください</p>
      </div>
    </div>
  );
};
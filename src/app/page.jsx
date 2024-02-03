'use client'
import { useState,useEffect } from 'react';
import BarcodeReader from './components/BarcodeReader';
import ProductDisplay from './components/ProductDisplay';
import PurchaseList from './components/PurchaseList';
import TitleBar from './components/TitleBar';
import Quagga from "quagga";

// import styles from '../styles/Home.module.css'; // Next.js推奨のCSSモジュールを使用する



export default function Home() {
  const [product, setProduct] = useState({});
  // const [product, setProduct] = useState({
  //   PRD_ID: 0,
  //   PRD_CD: "aaaa",
  //   PRD_NAME: "aaaa",
  //   PRD_PRICE: 500,
  // });
  const [items, setItems] = useState([]);
  const [showScanner, setShowScanner] = useState(false); // バーコードリーダーを表示するかどうかの状態
  const [animateTriangle, setAnimateTriangle] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  
  const handleScan = async (code) => {
    console.log("handleScan Start")

    setShowScanner(false); // スキャンが完了したらバーコードリーダーを非表示にする
    const res = await fetch(process.env.REACT_APP_API_URL + "/search_product/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: code }),
    });

    console.log(res)

    const data = await res.json();      
    if (data.status === "success") {
        setProduct(data.message);
      } else {
        setProduct({});
      }
  };

  const handleSearch = () => {
    //入ってなかった場合
    if (!searchCode) {
      alert("コードが入力されていません");
      return;
    }

    handleScan(searchCode);
  };

  const handleAdd = () => {
    //入ってなかった場合
    if (!product.PRD_NAME) {
      alert("スキャン商品が不正です");
      return;
    }

    setAnimateTriangle(true); // アニメーションを開始

    setTimeout(() => {
      setAnimateTriangle(false); // アニメーションをリセット
    }, 200); // CSSアニメーションの持続時間
    // itemsに入れる

    setItems([...items, product]);
    setProduct({});
  };

  const handlePurchase = async () => {
    if (items.length === 0) {
      alert("商品が追加されていません");
      return; // ここで関数を終了し、APIコールをスキップ
    }

    const purchaseData = {
      EMP_CD: "9999999999",
      STORE_CD: "00030",
      POS_NO: "090",
      items: items,
    };

    try {
      const response = await fetch(
        process.env.REACT_APP_API_URL + "/purchase/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(purchaseData),
        }
      );

      const responseData = await response.json();

      // APIから帰ってきたメッセージをポップアップで表示
      if (responseData.message) {
        alert(JSON.stringify(responseData.message, null, 2));
      }

      setItems([]); // itemsを空にします
    } catch (error) {
      console.error("Error making a purchase:", error);
    }
  };
  

  return (
    <div className="full-container">
      {/* showScannerがtrueならBarcodeReaderを表示する */}
      {showScanner ? ( // showScannerの状態に応じてバーコードリーダーを表示する
        <BarcodeReader onScan={handleScan} />

      ) : (
        <>
          <TitleBar />
          {/* カメラのオンオフ */}
          <div className="content-body">
            <div className="horizontal-container">
              <button
                className="osha-button"
                onClick={() => setShowScanner(true)}
              >
                スキャン
              </button>
              <p className="whitetext">OR</p>

              {/* 入力エリア。searchcodeで識別 */}
              <input
                type="text"
                value={searchCode}
                className="input_area"
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="コードを入力"
              />


              <button className="osha-button" onClick={handleSearch}>
              {/* 検索をおすとhandleSearchが起動 */}
                検索
              </button>
            </div>

            {/* プロダクトの名前が出る */}
            <ProductDisplay product={product} />

            <button className="osha-button" onClick={handleAdd}>
              追加
            </button>

            <div
              className={`triangle-down ${animateTriangle ? "animate" : ""}`}
            ></div>
            <div className="text-purchase">購入リスト</div>
            <PurchaseList items={items} />
            <button className="osha-button" onClick={handlePurchase}>
              購入
            </button>
          </div>
        </>
      )}
    </div>
  );
};
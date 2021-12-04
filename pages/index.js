import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useMoralis } from "react-moralis";
export default function Home() {
  const {
    authenticate,
    isAuthenticated,
    user,
    logout,
    Moralis,
    isInitialized,
  } = useMoralis();
  const [attachments, setAttachments] = useState([]);
  const inputRef = useRef(null);
  const [changeSwitch, setChangeSwitch] = useState(false);

  const onChangeHandler = async (e) => {
    const data = e.target.files[0];
    const file = new Moralis.File(data.name, data);
    await file.saveIPFS();
    const jobApplication = new Moralis.Object("Testfiles");
    jobApplication.set("name", "files");
    jobApplication.set("fileData", file);
    await jobApplication.save();
    setChangeSwitch(!changeSwitch);
  };

  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      const testAsync = async () => {
        const query = new Moralis.Query("Testfiles");
        query.equalTo("name", "files");
        const op = await query.find();
        const tempArr = [];
        op.forEach((item) => tempArr.push(item.attributes.fileData.ipfs()));
        setAttachments(tempArr);
      };
      testAsync();
    }
  }, [isInitialized, changeSwitch, isAuthenticated]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      {!user ? (
        <div className="flex flex-col gap-y-4">
          <button
            className="px-3 py-2 bg-yellow-300 text-white rounded-md hover:opacity-90"
            onClick={() => authenticate({ signingMessage: "Signing in" })}
          >
            login
          </button>
          <button
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:opacity-90"
            onClick={() =>
              authenticate({
                provider: "walletconnect",
                signingMessage: "Signing in",
              })
            }
          >
            login with wallet connect
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 items-center">
          <input
            type="file"
            ref={inputRef}
            onChange={onChangeHandler}
            className="hidden"
          />
          <button
            className="px-3 py-2 bg-red-600 text-white rounded-md hover:opacity-90 fixed top-5 right-5"
            onClick={() => logout()}
          >
            logout
          </button>
          <button
            onClick={() => inputRef.current.click()}
            className="px-3 py-2 bg-green-500 text-white hover:opacity-90 rounded-md"
          >
            Upload files
          </button>

          <HiddenScroll>
            {attachments?.map((imageUrl, index) => (
              <img
                src={imageUrl}
                alt="image"
                key={index}
                className="h-40 rounded-md"
              />
            ))}
          </HiddenScroll>
        </div>
      )}
    </div>
  );
}

const HiddenScroll = styled.div`
  display: flex;
  flex-direction: row;
  ::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
  column-gap: 1rem;
  overflow-x: scroll;
`;

import React from 'react'
import { useState } from 'react';
import { useGlobalState,setGlobalState } from '../store';
import { FaTimes } from 'react-icons/fa';
import { toast } from "react-toastify";
import { addReview, loadReviews } from "../Blockchain.services.js";
import {useParams} from 'react-router-dom'

const AddReview = () => {
    const [reviewText,setReviewText] = useState('')
    const [reviewModal] = useGlobalState('reviewModal')
    const {id} = useParams()

    const resetForm = () => {
       setReviewText('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if(!reviewText)  return

        const params = {
          id,
          reviewText
        }


        await toast.promise(
          new Promise(async (resolve, reject) => {
            await addReview(params)
              .then(async () => {
                setGlobalState("reviewModal", "scale-0");
                resetForm();
                resolve();
                loadReviews(id);
              })
              .catch(() => reject());
          }),
          {
            pending: "Approve transaction...",
            success: "review posted successfully 👌",
            error: "Encountered error 🤯",
          }
        );

    }

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-50 transform z-[3000] transition-transform duration-300 ${reviewModal}`}
    >
      <div className="bg-white shadow-lg shadow-slate-900 rounded-xl w-11/12 md:w-2/5 h-7/12 p-6">
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="flex flex-row justify-between items-center">
            <p className="font-semibold">Add a review today</p>
            <button
              type="button"
              className="border-0 bg-transparent focus:outline-none"
              onClick={() => setGlobalState("reviewModal", "scale-0")}
            >
              <FaTimes className="text-gray-400 hover:text-blue-400" />
            </button>
          </div>
          <div className="flex flex-col justify-center items-center rounded-xl mt-5 mb-5">
            <div className="flex justify-center items-center rounded-full overflow-hidden h-10 w-40 shadow-md shadow-slate-300 p-4">
              <p className="text-lg font-bold text-slate-700">
                {" "}
                DappBnB
              </p>
            </div>
            <p className="p-2">Add your review below</p>
          </div>
          <div className="flex flex-row justify-between items-center bg-gray-300 rounded-xl mt-5 p-2">
            <textarea
              className="block w-full text-sm resize-none text-slate-500 
              bg-transparent border-0 focus:outline-none focus:ring-0 h-20"
              type="text"
              name="comment"
              placeholder="review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="flex flex-row justify-center items-center w-full text-white text-md bg-blue-400 py-2 px-5 rounded-full drop-shadow-xl border border-transparent hover:bg-transparent hover:text-blue-400 hover:border hover:border-blue-400 focus:outline-none focus:ring mt-5"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddReview

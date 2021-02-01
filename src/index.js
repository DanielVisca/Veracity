import axios from "axios";
const log = console.log
const api = "https://know-your-news.herokuapp.com/analysis";
// const errors = document.getElementsByClassName("errors");
const results = document.getElementsByClassName("result-container")
const loading = document.getElementsByClassName("loading");
const sentiment = document.getElementsByClassName("sentiment");
const topic = document.getElementsByClassName("topic");
log(sentiment)
log(topic)
log(results)
let current_url = "";
// loading.style.display = "none";
// errors.style.textContent = "";

// get the button that starts the analysis
const btn = document.querySelector(".start-btn");

// declare a method to start the analysis
const analyse_page = async => {
  // loading.style.display = "block";
  // errors.textContent = "";
  // get url
  chrome.tabs.query({ active: true, currentWindow: true}, function (tabs) {
      console.log(tabs[0].url.toString())
      current_url = tabs[0].url.toString();
    })
  // call api
  try {
    axios.post(api, {
      url: current_url
    })
    .then((response) => {
      console.log("response.data")
      console.log(response.data.sentiment.text)
      console.log(response.data.topics)
      // loading.style.display = "none";
      sentiment.textContent = response.data.sentiment.text;
      topic.textContent = response.data.topics;
    })
    .catch(error => {
      console.log(error.response)
    })
  } catch (error) {
    // loading.style.display = "none";
    // errors.textContent = "There was an error"
    log("There is an error")
  }
}

// declare a function to handle button click
const handleClick = async e => {
  e.preventDefault();
  analyse_page();
}

btn.addEventListener("click", e => handleClick(e))
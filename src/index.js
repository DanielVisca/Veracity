// Tutorial this is extension is loosely based on
// https://github.com/onedebos/covtension/blob/master/src/index.js
const log = console.log

import axios from "axios";

// API endpoint
const api = "https://131306059839.ngrok.io/analysis";
// const api = "https://know-your-news.herokuapp.com/analysis";

// Retrieve elements from html
const errors = document.getElementsByClassName("errors")[0];
const results = document.getElementsByClassName("result-container")[0];
const loading = document.getElementsByClassName("loading")[0];
const sentiment = document.getElementsByClassName("sentiment")[0];
const topic = document.getElementsByClassName("topic")[0];
const bias = document.getElementsByClassName("bias")[0];
const source = document.getElementsByClassName("source")[0];
const factual_reporting = document.getElementsByClassName("factual-reporting")[0];
const mbfc_url = document.getElementsByClassName("mbfc-url")[0];
const mbfc = document.getElementsByClassName("mbfc")[0];
const title = document.getElementsByClassName("title")[0];
const title_sentiment = document.getElementsByClassName("title-sentiment")[0];
// Related News
const similar_news_title = document.getElementsByClassName("similar-news-title")[0];
const similar_news_url = document.getElementsByClassName("similar-news-url")[0];
const similarity_score = document.getElementsByClassName("similarity-score")[0];


// display nothing to begin with
loading.style.display = "none";
errors.style.textContent = "";
results.style.display = "none";
// mbfc.style.display = "";

// declare a method to start the analysis
const analyse_page = () => {
  loading.style.display = "block";
  errors.style.textContent = "";

  // Retrieve the current tab, this call is async
  chrome.tabs.query({ active: true, currentWindow: true}, function (tabs) {
    let current_url = tabs[0].url.toString();

    // call api
    try {
      axios.post(api, {
        url: current_url
      })
      .then((response) => {
        // Response is successful
        log("current_url")
        log(current_url)
        log("response")
        log(response.data)
        // Populate Article info
        title.textContent = response.data.title;
        title_sentiment.textContent = response.data.sentiment.title;
        sentiment.textContent = response.data.sentiment.text;
        topic.textContent = response.data.topics;
        // media bias data is not null, populate mbfc info
        // if (response.data.mbfc != null) {
        source.textContent = response.data.mbfc.Source
        bias.textContent = response.data.mbfc.Bias
        mbfc_url.textContent = response.data.mbfc.URL
        const facts = response.data.mbfc["Factual Reporting"]
          // Factual Reporting is Null when the site is satire
          //if (facts == ""){
          //  factual_reporting.textContent = "Fake News"
          //} else {
        factual_reporting.textContent = facts
          //}
          // display mbfc div
        // mbfc.style.display = "block";
        // }
        // mbfc is null, do not display div
        // else {
        //   mbfc.style.display = "";
        // }
        // hide loading, display results
        similar_news_title.textContent = response.data.related_news.most_similar_title
        similar_news_url.textContent = response.data.related_news.most_similar_url
        similarity_score.textContent = response.data.related_news.similarity_score + '%'

        loading.style.display = "none";
        results.style.display = "block";
      })
      .catch(error => {
        // Hide loading, display error
        loading.style.display = "none";
        errors.textContent = "Uh oh! There was an error with out server, Try again?"
        console.log(error.response) 
      })
    } catch (error) {
      // Hide loading, display error
      loading.style.display = "none";
      errors.textContent = "There was an API error"
      log("There is an error")
    }
  })
}

analyse_page();


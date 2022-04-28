/* TODO: inserite il codice JavaScript necessario a completare il MHW! */
const madechs = {};
const button = document.querySelector('.button');
const choices = document.querySelectorAll('.choice-grid div');
let srcCat = null;
let trackDetails = {
	"titolo": null,
	"artista": null,
	"link": null
};
let once = true;

function removeListeners(){
	for(let item of choices){
		item.removeEventListener("click", makeChoice);
	}
}
function addListeners(){
	for(let item of choices){
		item.addEventListener("click", makeChoice);
	}
}
function decMaker(){
	if(madechs["two"] === madechs["three"])
		return "two";
	else
		return "one";
}
function resetMadechs(){
	madechs["one"] = madechs["two"] = madechs["three"] = null;
}
function mdeselection(div){
	const chbd = div.querySelector(".checkbox");
	chbd.src = "./images/unchecked.png";
	div.classList.remove('selected');
	div.classList.add('unchecked');
}
function mselection(div){
	const chb = div.querySelector(".checkbox");
	chb.src = "images/checked.png";
	div.classList.remove('unchecked');
	div.classList.add('selected');
}

function makeChoice(event){
	const madeCh = event.currentTarget;
	const divs = madeCh.parentNode.childNodes;
	for(let div of divs){
		if(div.nodeType === 1){
			mdeselection(div);
		}
	}
	mselection(madeCh);
	madechs[madeCh.dataset.questionId] = madeCh.dataset.choiceId;
	//displayResult();
	getInfo();
}

function restartQ(){
	const res = document.querySelector('.results');
	for(let div of choices){
		div.querySelector(".checkbox").src = "./images/unchecked.png";
		div.classList.remove('selected');
		div.classList.remove('unchecked');
	}
	resetMadechs();
	res.classList.add("hidden");
	addListeners();
	scrollTo(0, 0);
	srcCat = null;
	trackDetails["titolo"] = null;
	trackDetails["artista"] = null;
	trackDetails["link"] = null;
	once = true;
}

function onResponse(data){
	return data.json();
}

function displayResult(){
	if(once == true && srcCat != null && trackDetails["titolo"] != null){
		const descr = document.querySelector('#descr');
		const title = document.createElement("h1");
		const catImage = document.createElement("img");
		const catDescr = document.createElement("p");
		const trkDescr = document.createElement("p");
		const trkLink  = document.createElement("a");
		const content = document.createElement("p");
		const to_resmap = decMaker();
		descr.innerHTML = '';		//Elimina tutto il blocco dei risultati
		title.innerText = RESULTS_MAP[madechs[to_resmap]]["title"];
		content.innerText = RESULTS_MAP[madechs[to_resmap]]["contents"];

		catImage.src = srcCat;
		catDescr.innerText = "Potresti essere come questo gatto!";

		trkDescr.innerText = "Secondo noi questo brano potrebbe essere di tuo gradimento";
		trkLink.href = trackDetails["link"];
		trkLink.innerText = trackDetails["artista"] + " - " + trackDetails["titolo"];
		trkLink.target = "_blank";		//Open to new tab
		descr.appendChild(title);
		descr.appendChild(content);
		descr.appendChild(catDescr);
		descr.appendChild(catImage);
		descr.appendChild(trkDescr);
		descr.appendChild(trkLink);
		document.querySelector('.results').classList.remove("hidden");
		once = false;
	}
}
function getInfo(){
	if( madechs["one"]   !== null &&
		madechs["two"]   !== null &&
		madechs["three"] !== null)
		{	
			removeListeners();
			getCat();
			getTrack();
		}
}


function getCat(){
	const cat_x_api_key = "f7ac480e-b56a-4066-a398-4038af8eba06";
	fetch("https://api.thecatapi.com/v1/images/search",
	{
		headers: {
			"x-api-key" : cat_x_api_key
		}
	})
	.then(onResponse).then(data =>{
		srcCat = data[0].url;
		displayResult();
	});
}

function getTrack(){
	const sp_id = "b6f246a23345403b983728abf9228d4b";
	const sp_sc = "f1fed0810faa4a1d9007221c37a695d9";
	fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Authorization': 'Basic '  + window.btoa(sp_id + ':' + sp_sc),
			'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
		},
		body: 'grant_type=client_credentials'
	})
	.then(onResponse)
	.then(token => {
		const randomOffset = Math.floor(Math.random() * 100);
		const query = encodeURIComponent(getRandomSearch());
		fetch(	"https://api.spotify.com/v1/search?q=" + query + 
				"&type=track&limit=1&&offset=" + randomOffset,
			{
				method: 'GET',
				headers:{
					'Authorization': 'Bearer ' + token.access_token
				}
			}
		)
		.then(onResponse)
		.then(data => {
			trackDetails["titolo"] = data.tracks.items[0].name;
			trackDetails["artista"] = data.tracks.items[0].artists[0].name;
			trackDetails["link"] = data.tracks.items[0].external_urls.spotify;
			displayResult();
		});
	});
}


function getRandomSearch() {
	const chars = "qwertyuiopasdfghjklzxcvbnm";
	const rchar = chars.charAt(Math.floor(Math.random() * chars.length));
	let randomSearch = '';
	//Creazione pattern di ricerca
	switch (Math.round(Math.random())) {
	  case 0:
		randomSearch = rchar + '%';
		break;
	  case 1:
		randomSearch = '%' + rchar + '%';
	}
  
	return randomSearch;
}


/*
 * Aggiunta dei listener e inizializzazione scelte
 */

resetMadechs();
addListeners();
button.addEventListener('click', restartQ);

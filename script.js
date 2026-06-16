async function cerca(){
 var input = document.getElementById("searchInput").value;
 if(input){
    var response = await fetch("https://www.cheapshark.com/api/1.0/games?title=" + input);

    const data = await response.json();

    if(data < 1){
        alert("nessun gioco");
    }
    html = "";
    data.forEach(game => {
        html += "<div class='game' onclick=\"clickGioco("+ game.gameID + ")\">";
        html += "<img src=" + game.thumb + " class=\"thumb\">";
        html += "<a href=\"https://www.cheapshark.com/redirect?dealID=" + game.cheapestDealID + "\" class=\"title\" target=\"_blank\">" + game.external + "</a>";
        html += "<p class=\"price\">Prezzo: " + game.cheapest + "</p>";
        html += "</div>";
    });
    console.log(data);
    document.getElementById("results").innerHTML = html;

 }else{
    return "";
 }
}

function clickGioco(id){
    alert(id);
}
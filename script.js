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
        html += "<h3 class=\"title\">" + game.external + "</h3>";
        html += "<p class=\"price\">Prezzo: " + game.cheapest + "</p>";
        html += "<a class=\"link\" href='https://www.cheapshark.com/redirect?dealID=" + game.dealID + "'>Vai al sito</a>";
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
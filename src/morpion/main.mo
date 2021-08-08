import Array "mo:base/Array";
import Text "mo:base/Array";
import Nat32 "mo:base/Nat32";
import Iter "mo:base/Iter";

actor morpion {


    flexible var stateGame : Bool = false; //True if a game is taking place False if not
    flexible var aChange : Bool = false; // need to explain that
    flexible var Players : [Text] = [];
    var selectedCell : Nat32 = 56;
    var hasLeave : Bool = false;

    public func addPlayer (id:Text) : async Bool {
        let newPlayer = Array.make<Text>(id);
        Players := Array.append<Text>(Players,newPlayer);
        var counter = 0;
        for (player in Iter.fromArray(Players)) {
            counter +=1;
             if (counter == 2) {
                stateGame := true;
                return true;
            };
        };
        return false;
    };

    public query func seePlayers () : async [Text] {
        Players;
    };

   public query func numberPlayer () : async Bool {
        var counter = 0;
        for (player in Iter.fromArray(Players)) {
            counter +=1;
            if (counter == 2) {
                return true;
            }

        };
        return false;
    };


    public query func stateOfGame () : async Bool {
        return stateGame;
    };


    
    public query func player1 () : async Text {
        return Players[0];
    };

    public query func player2 () : async Text {
        return Players[1];
    };




    public query func isThereAChange () : async [(Bool,Nat32)] {
        return ([(aChange,selectedCell)]);
    };

    public func ImakeAChange (nbCell : Nat32) : async () {
        if (aChange) {
            aChange := false;
            selectedCell := nbCell;
            return;
        };
        aChange := true;
        selectedCell := nbCell;
        return;
    };

    public func ClearAll () : async () {
        stateGame := false;
        selectedCell := 56;
        Players := [];
        aChange := false;
        hasLeave := false;
        return;
    };

    public func userLeave() : async() { 
        if ( hasLeave) {
            hasLeave := true;
            return;
        };
        
         hasLeave := false;
         return;
        
    };

    public query func userLeaved() : async Bool {
        return hasLeave;
    };

};

db.friends.find({}).forEach(
  function(friend) {
    if(friend) {
    	db.users.update({
        _id: friend.user
      }, {
        $set: {
          'friends': friend._id
        }
      })   
    }
    
  }
)
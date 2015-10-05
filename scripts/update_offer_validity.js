//db.getCollection('outlets').update({$and: [{'offers.offer_end_date': {$gte: new Date('09/25/2015')}},{'offers.offer_end_date': {$lte: new Date('10/01/2015')}}]}, {$set: {'offers.$.offer_end_date': new Date('10/31/2015')}})

//ObjectId("530ef84902bc583c21000004")
//ObjectId("5532298fbf7795f9365cc37e")



db.outlets.find({$and: [{'offers.offer_end_date': {$gte: new Date('09/25/2015')}},{'offers.offer_end_date': {$lte: new Date('10/01/2015')}}]}).forEach(
  function(outlet) {
    if(outlet) {
    	//print(outlet.offers.length)
      var date = new Date('11/01/2015');
       for(var i = 0; i< outlet.offers.length; i++){
       	print(outlet.offers[i]._id)
      		db.outlets.update({
		        'offers._id': outlet.offers[i]._id
		      }, {
		        $set: {
		          
		          'offers.$.offer_end_date': date
		        }
		      }) 

		      //print('here')	
       }
      
    }
    
  }
)





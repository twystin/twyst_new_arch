angular.module('merchantApp')
	.directive("imagereader", ['imageSvc', 'toastr', '$log',
		function(imageSvc, toastr, $log) {
			return {
				require: 'ngModel',
				restrict: 'E',
				scope: {
					ngOutletId: '='
				},
				template: "<img class='img-polaroid'/><input id='fileInput' type='file' style='display: none;'/>",
				link: function(scope, element, attributes, ngModel) {
					var fileElement = $(angular.element('<input id="fileUpload" type="file" />')),
						imgElement = element.find('img')[0];
					
					fileElement.on('change', function(changeEvent) {
						var file = changeEvent.target.files[0];
						var regex = /^image\//i;
						
						if(regex.test(file.type)) {
							var reader = new FileReader();
							reader.onload = function(loadEvent) {
								var req_obj = {
									'image': loadEvent.target.result
								};
								if(scope.ngOutletId) {
									req_obj.id = scope.ngOutletId;
								}
								imageSvc.uploadImage(req_obj).then(function(res) {
									scope.ngOutletId = res.id;
									$(imgElement).attr('src', res.url);
									ngModel.$setViewValue(res.url);
								}, function(err) {
									console.log('error', err);
								});
							}
							reader.readAsDataURL(changeEvent.target.files[0]);
						}
						
					});
					element.bind('click', function() {
						fileElement.trigger('click');
					})
					element.css('cursor', 'pointer');
					scope.$watch(function() {
						return ngModel.$modelValue;
					}, function(v) {
						if(v)
							$(imgElement).attr('src', v);
					});
				}
				// link: function(scope, element, attributes, ngModel) {
				// 	var fileElement = $(angular.element('<input id="fileUpload" type="file" />')),
				// 		imgElement = element.find('img')[0];

				// 	fileElement.on('change', function(changeEvent) {
				// 		var file = changeEvent.target.files[0];
				// 		if(/^image\//i.test(file.type)) {
				// 			var reader = new FileReader();
				// 			reader.onload = function(loadEvent) {
				// 				scope.$apply(function() {
				// 					$(imgElement).attr('src', loadEvent.target.result);
				// 					ngModel.$setViewValue(loadEvent.target.result);
				// 				});
				// 				$(imgElement).attr('src', loadEvent.target.result);
				// 			}
				// 			reader.readAsDataURL(changeEvent.target.files[0]);
				// 		}
				// 	});
				// 	element.bind('click', function() {
				// 		fileElement.trigger('click');
				// 	});
				// 	element.css('cursor', 'pointer');
				// 	scope.$watch(function() {
				// 		return ngModel.$modelValue;
				// 	}, function(v) {
				// 		if(v)
				// 			$(imgElement).attr('src', v);
				// 	});
				// }
			}
		}
	]);
var websiteInfo={
    "status": "success",
    "message": "",
    "data": {
        "userInfo": {
            "userId": 1,
            "userName": "admin",
            "userType": "admin|superadmin",
            "userheadImg": "头像地址",
            "phone": "",
            "email": "",
            "sex": 1,
			"authority":{
				userAuthority:[
					{name:"statisticAnalysis",title:"数据统计分析",enable:true},
					{name:"safetyManagement",title:"房屋安全管理",enable:true},
					{name:"houseExpropriation",title:"房屋征收管理",enable:true},
					{name:"undergroundSpace",title:"地下空间管理",enable:true},
					{name:"agreementPremise",title:"物业信息管理",enable:true},
					{name:"realEstateMarket",title:"房地产市场管理",enable:true},
					{name:"publicHouse",title:"直管公房管理",enable:true},
					{name:"stateHouse",title:"区属国有房产管理",enable:true},
					{name:"illegalConstruction",title:"违法建设管理",enable:true},
					{name:"integratedManagement",title:"三二维一体化管理",enable:false},
					{name:"mobileEnforcement",title:"移动执法终端",enable:false},
					{name:"decisionAnalysis",title:"决策分析移动终端",enable:false}
				]
			}
        },
        "serverInfo": {
            "platformUrl": "htttp://平台地址/",
            "platformName": "平台名称",
            "logo": "",
            "favicon": "小图标路径"
        }
    }
}
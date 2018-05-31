/**
 * Created by Administrator on 2017/7/10.
 */

var  tagsData;
function bindTagEvent(addButtonId,treeId,tagValueId) {
    //添加标签
    $("#"+addButtonId).click(function () {
        $.confirm({
            title: '标签选择',
            confirmButton: '确认',
            cancelButton: '取消',
            content: '<div id="'+treeId+'"></div>',
            onContentReady: function () {
                $.get("http://101.251.213.44:9401/tags/initTree", function (data) {
                    data = JSON.parse(data);
                    initTagTree(data.data);
                    tagsData=data.data;
                });
            },
            buttons: {
                formSubmit: {
                    text: '确认',
                    btnClass: 'btn-blue',
                    action: function () {
                        var instance = $('#'+treeId).jstree(true);
                        var ruleTags = getRuleTags(instance);
                        if (ruleTags != null && ruleTags.length > 0) {
                            $("#"+tagValueId).val(ruleTags);
                        } else {
                            return false;
                        }
                    }
                },
                cancel: {
                    text: '取消'
                }
            },
        });
    });
    function getRuleTags(instance) {
        var idsArray = instance.get_selected();
        var nodeArray = getNodesByIds(instance);
        var loopFirstTag;
        var loopSecTag;
        var loopThirdTag;
        var loopChildren;
        var loopSecChildren;
        var loopSecNode;
        var loopThirdNode;
        var loopFourthNode;
        var loopFourthTag;
        var  loopThirdChildren;
        var allTag="";
        for (var i = 0; i < nodeArray.length; i++) {
            if (nodeArray[i].original.type == 1) {//一级标签
                loopFirstTag = nodeArray[i].text;
                loopChildren = nodeArray[i].children;//所有子
                if(allTag){
                    allTag=allTag+","+loopFirstTag;
                }else{
                    allTag=allTag+loopFirstTag;

                }
                var hasSecond=0;
                if (loopChildren != null && loopChildren.length > 0) {
                    for (var j = 0; j < loopChildren.length; j++) {
                        if (idsArray.indexOf(loopChildren[j]) != -1) {
                            loopSecNode = instance.get_node(loopChildren[j]);
                            loopSecTag = loopSecNode.text;
                            if(hasSecond==0){
                                allTag=allTag+":"+loopSecTag;
                            }else{
                                allTag=allTag+"|"+loopSecTag;
                            }
                            hasSecond=hasSecond+1;
                            var hasThird=0;
                            if (loopSecNode.original.type == 2) {//二级标签
                                loopSecChildren = loopSecNode.children;
                                if (loopSecChildren != null && loopSecChildren.length > 0) {
                                    for (var m = 0; m < loopSecChildren.length; m++) {
                                        if (idsArray.indexOf(loopSecChildren[m]) != -1) {//三级标签
                                            loopThirdNode = instance.get_node(loopSecChildren[m]);
                                            loopThirdTag = loopThirdNode.text;
                                            if(hasThird==0){
                                                allTag=allTag+"#"+loopThirdTag;
                                            }else{
                                                allTag=allTag+"+"+loopThirdTag;
                                            }
                                            hasThird=hasThird+1;
                                            var  hasFourth=0;
                                            if(loopThirdNode.original.type == 3){
                                                loopThirdChildren = loopThirdNode.children;
                                                if(loopThirdChildren != null && loopThirdChildren.length > 0){
                                                    for(var n=0;n<loopThirdChildren.length;n++){
                                                        if (idsArray.indexOf(loopThirdChildren[n]) != -1){ //四级标签
                                                            loopFourthNode = instance.get_node(loopThirdChildren[n]);
                                                            loopFourthTag = loopFourthNode.text;
                                                            if(hasFourth==0){
                                                                allTag=allTag+"@"+loopFourthTag;
                                                            }else{
                                                                allTag=allTag+"&"+loopFourthTag;
                                                            }
                                                            hasFourth=hasFourth+1;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                            }
                        }
                    }
                }
            }
        }
        return allTag;
    }
    function getNodesByIds(instance) {
        var selectArray = instance.get_selected();
        var nodeArray = [];
        if (selectArray != null && selectArray.length > 0) {
            for (var i = 0; i < selectArray.length; i++) {
                nodeArray.push(instance.get_node(selectArray[i]));
            }
        }
        return nodeArray;
    }
    function initTagTree(dataArray) {
        $('#'+treeId).jstree({
            "checkbox": {
                "keep_selected_style": true,
                "three_state": false //去除父子间节点选择的级联关系
            },
            'core': {
                'data': dataArray
            },
            'plugins': ["wholerow", "checkbox"]
        }).on('loaded.jstree', function(e, data){
            var inst = data.instance;
            markSelectedTag(tagValueId,treeId,inst);
        })
        initTreeChangedEvent();
    }
    function initTreeChangedEvent() {
        $('#'+treeId).on("changed.jstree", function (e, data) {
            var lastClickNodeId = data.selected[data.selected.length - 1];
            var curNode = data.instance.get_node(lastClickNodeId);
            $('#'+treeId).jstree(true).open_node(curNode);
            // 选中字节点父节点都选中
            if(data.node){
                var  parents=data.node.parents;
                for (var i = 0; i < parents.length; i++) {
                    var current = data.instance.get_node(parents[i]);
                    data.instance.select_node(current);
                }
            }
        });
    }
    //回显选中的标签
    function  markSelectedTag(tagValueId,treeId,inst){
        if($("#"+tagValueId).val()){
            var  tag=$("#"+tagValueId).val();
            var tags=[];
            var tagArray=tag.split(",");
            for(var i=0;i<tagArray.length;i++){
                var  current=tagArray[i];
                if(current.indexOf(":")!=-1){
                    //有二级
                    var  tag1=current.substring(0,current.indexOf(":"));
                    var  tag234=current.substring(current.indexOf(":")+1,current.length+1);
                    var tagArray234=tag234.split("|");
                    for(var j=0;j<tagArray234.length;j++){
                        var  current234=tagArray234[j];
                        if(current234.indexOf("#")!=-1){
                            //有三级
                            var  tag2=current234.substring(0,current234.indexOf("#"));
                            var tag34=current234.substring(current234.indexOf("#")+1,current234.length+1);
                            var tagArray34=tag34.split("+");
                            for(var m=0;m<tagArray34.length;m++){
                                var current34=tagArray34[m];
                                if(current34.indexOf("@")!=-1){
                                    //有四级标签
                                    var  tag3=current34.substring(0,current34.indexOf("@"));
                                    var  tagAll4=current34.substring(current34.indexOf("@")+1,current34.length+1);
                                    var  tagAllArray4=tagAll4.split("@");
                                    //有四级标签
                                    for(var n=0;n<tagAllArray4.length;n++){
                                        var current4=tagAllArray4[n];
                                        var tagarrArray4=current4.split("&");
                                        for(var k=0;k<tagarrArray4.length;k++){
                                            var tag4=tagarrArray4[k];
                                            var tagObject={};
                                            tagObject.tag1=tag1;
                                            tagObject.tag2=tag2;
                                            tagObject.tag3=tag3;
                                            tagObject.tag4=tag4;
                                            tags.push(tagObject);
                                        }
                                    }
                                }else{
                                    // 没有四级标签, 只到三级标签
                                    var tagObject={};
                                    tagObject.tag1=tag1;
                                    tagObject.tag2=tag2;
                                    tagObject.tag3=current34;
                                    tags.push(tagObject);
                                }
                            }
                        }else{
                            // 只到二级
                            var tagObject={};
                            tagObject.tag1=tag1;
                            tagObject.tag2=current234;
                            tags.push(tagObject);
                        }
                    }
                }else{
                    //只到一级
                    var tagObject={};
                    tagObject.tag1=current;
                    tags.push(tagObject);
                }
            }
            for(var i=0;i<tagsData.length;i++) {
                var  current=tagsData[i];
                var   type=current.type;
                if(type==1){
                    for(var n=0;n<tags.length;n++){
                        //只到一级
                        if(tags[n].tag1&&!tags[n].tag2&&!tags[n].tag3&&!tags[n].tag4){
                            if(current.text==tags[n].tag1){
                                var currentId = inst.get_node(Number(tagsData[i].id));
                                inst.select_node(currentId);
                            }
                        }
                    }
                }else if(type==2){
                    for(var n=0;n<tags.length;n++){
                        //只到二级
                        if(tags[n].tag2&&!tags[n].tag3&&!tags[n].tag4){
                            var tagObiject1=getTagById(current.parent);
                            var tag1=tagObiject1.text;
                            if(current.text==tags[n].tag2&&tag1==tags[n].tag1){
                                var currentId = inst.get_node(Number(tagsData[i].id));
                                inst.select_node(currentId);
                            }
                        }
                    }
                } else if(type==3){
                    for(var n=0;n<tags.length;n++){
                        //只到三级
                        if(tags[n].tag3&&!tags[n].tag4){
                            var tagObiject2=getTagById(current.parent);
                            var tag2=tagObiject2.text;
                            var tagObiject1=getTagById(tagObiject2.parent);
                            var tag1=tagObiject1.text;
                            if(current.text==tags[n].tag3&&tag2==tags[n].tag2&&tag1==tags[n].tag1){
                                var currentId = inst.get_node(Number(tagsData[i].id));
                                inst.select_node(currentId);
                            }
                        }
                    }
                } else if(type==4){
                    for(var n=0;n<tags.length;n++){
                        if(tags[n].tag4){
                            var tagObiject3=getTagById(current.parent);
                            var tag3=tagObiject3.text;
                            var  tagObiject2=getTagById(tagObiject3.parent);
                            var tag2=tagObiject2.text;
                            var  tagObiject1=getTagById(tagObiject2.parent);
                            var tag1=tagObiject1.text;
                            if(current.text==tags[n].tag4&&tag3==tags[n].tag3&&tag2==tags[n].tag2&&tag1==tags[n].tag1){
                                var currentId = inst.get_node(Number(tagsData[i].id));
                                inst.select_node(currentId);
                            }
                        }
                    }
                }
            }
            function  getTagById(id){
                var current={};
                for(var i=0;i<tagsData.length;i++){
                    if(tagsData[i].id==id){
                        current=tagsData[i];
                    }
                }
                return current;
            }
        }
    }


}

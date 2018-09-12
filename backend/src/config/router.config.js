module.exports = {
    '/api':{
        '/menu':{
            get:'sys.menu.list',
            post: 'sys.menu.add',
            '/:id': {
                put: 'sys.menu.update',
                delete: 'sys.menu.delete'
            },
            '/tree': {
                get: 'sys.menu.tree'
            },
        },
        '/dep':{
            get: 'sys.dep.list',
            post: 'sys.dep.add',
            '/:id':{
                put:'sys.dep.update',
                delete: 'sys.dep.delete'
            },
            '/tree':{
                get:'sys.dep.tree'
            }
        },
        '/role':{
            get:'sys.role.list',
            post:'sys.role.add',
            '/:id':{
                put:'sys.role.update',
                delete:'sys.role.delete'
            },
            '/byDepId':{
                get:'sys.role.getListByDepId'
            }
        },
        '/rule':{
            get: 'sys.rule.list',
            post: 'sys.rule.add',
            '/:id': {
                delete: 'sys.rule.delete'
            }
        },
        '/user':{
        	post: 'sys.user.add',
        	get: 'sys.user.list',
            '/signin': {
                post: 'sys.user.signIn'
            },
            '/signout': {
                post: 'sys.user.signOut'
            }
        },
        '/config':{
            get:'sys.config.list',
            post:'sys.config.add',
            '/:id':{
                put: 'sys.config.update',
                delete: 'sys.config.delete'
            }
        },
        '/log':{
            get: 'sys.log.list',
        },
    }
    
}


// module.exports = {
//     '/api': {
//         '/user': {
//             '/add': {
//                 post: 'system.user.add'
//             },
//             '/:id': {
//                 put: 'system.user.update',
//                 delete: 'system.user.delete'
//             },
//             '/lists': {
//                 get: 'system.user.lists'
//             },
//             '/userInfo': {
//                 get: 'system.pwd.userInfo',
//                 '/:id': {
//                     put: 'system.pwd.update'
//                 },
//             }
//         },
//         '/dep': {
//             '/add': {
//                 post: 'system.dep.add'
//             },
//             '/:id': {
//                 put: 'system.dep.update',
//                 delete: 'system.dep.delete'
//             },
//             '/lists': {
//                 get: 'system.dep.lists'
//             },
//             '/treeList': {
//                 get: 'system.dep.treelist'
//             }
//         },
//         '/roles': {
//             '/add': {
//                 post: 'system.roles.add'
//             },
//             '/:id': {
//                 put: 'system.roles.update',
//                 delete: 'system.roles.delete',
//             },
//             '/auth/:id': {
//                 put: 'system.roles.updateAuth',
//             },
//             '/edit/:id': {
//                 get: 'system.roles.one'
//             },
//             '/lists': {
//                 get: 'system.roles.lists'
//             },
//             '/listsByDepId': {post: 'system.roles.getListsByDepId'}
//         },
//         '/rule': {
//             '/add': {
//                 post: 'system.rule.add'
//             },
//             '/:id': {
//                 put: 'system.rule.update',
//                 delete: 'system.rule.delete'
//             },
//             '/lists': {
//                 get: 'system.rule.lists'
//             },
//             '/alllists': {
//                 get: 'system.rule.allLists'
//             },
//             '/rulelists': {
//                 get: 'system.rule.getUserRules'
//             }
//         },
//         '/menu': {
//             '/lists': {
//                 get: 'system.menu.lists'
//             },
//             '/listsTree': {
//                 get: 'system.menu.listsTree'
//             },
//             '/add': {
//                 post: 'system.menu.add'
//             },
//             '/:id': {
//                 put: 'system.menu.update',
//                 delete: 'system.menu.delete'
//             }
//         },
//         '/config': {
//             '/add': {
//                 post: 'system.config.add'
//             },
//             '/:id': {
//                 put: 'system.config.update',
//                 delete: 'system.config.delete'
//             },
//             '/lists': {
//                 get: 'system.config.lists'
//             }
//         },
//         '/logs': {
//             '/lists': {
//                 get: 'system.logs.getAllLogs'
//             },
//         },
//         '/signin': {
//             post: 'login.signIn'
//         },
//         '/signout': {
//             post: 'login.signOut'
//         },
//         '/news': {
//             '/add': {
//                 post: 'news.news.add'
//             },
//             '/ueditor': {
//                 get: 'news.news.ueConfig',
//                 post: 'news.news.ueUpload'
//             },
//             '/remove/:id': {
//                 delete: 'news.news.removeoss'
//             },
//             '/lists': {
//                 get: 'news.news.lists'
//             },
//             '/publish': {
//                 '/home': {
//                     post: 'news.news.publishHome'
//                 },
//                 '/all': {
//                     post: 'news.news.publishAll'
//                 },
//                 '/:id': {
//                     post: 'news.news.publish'
//                 }
//             },
//             '/:id': {
//                 get: 'news.news.one',
//                 put: 'news.news.update',
//                 delete: 'news.news.delete'
//             },
//             '/type': {
//                 '/add': {
//                     post: 'news.type.add'
//                 },
//                 '/:id': {
//                     put: 'news.type.update',
//                     delete: 'news.type.delete'
//                 },
//                 '/search': {
//                     get: 'news.type.lists'
//                 },
//                 '/alllists': {
//                     get: 'news.type.allLists'
//                 }
//             },
//             '/seo': {
//                 '/add': {
//                     post: 'news.seo.add'
//                 },
//                 '/:id': {
//                     put: 'news.seo.update',
//                     delete: 'news.seo.delete'
//                 },
//                 '/lists': {
//                     get: 'news.seo.lists'
//                 }
//             }
//         },
//         '/hetrone': {
//             "/news/:id": {
//                 get: 'news.news.previewHetrone'
//             },
//         },
//         '/contracts': {
//             '/add': {
//                 post: 'contracts.contracts.add'
//             },
//             '/lists': {
//                 get: 'contracts.contracts.lists'
//             },

//             '/publish/:id': {
//                 post: 'contracts.contracts.publish'
//             },
//             '/:id': {
//                 get: 'contracts.contracts.one',
//                 post: 'contracts.contracts.publish',
//                 put: 'contracts.contracts.update',
//                 delete: 'contracts.contracts.delete'
//             },
//             '/type': {
//                 '/add': {
//                     post: 'contracts.type.add'
//                 },
//                 '/:id': {
//                     put: 'contracts.type.update',
//                     delete: 'contracts.type.delete'
//                 },
//                 '/lists': {
//                     get: 'contracts.type.lists'
//                 }
//             },
//             '/history': {
//                 '/lists': {
//                     get: 'contracts.history.getAllHistory'
//                 },
//                 '/:id': {
//                     get: 'contracts.history.rollback'
//                 }
//             },
//             '/vm': {
//                 '/add': {
//                     post: 'contracts.vm.add'
//                 },
//                 '/:id': {
//                     put: 'contracts.vm.update',
//                     delete: 'contracts.vm.delete'
//                 },
//                 '/lists': {
//                     get: 'contracts.vm.lists'
//                 }
//             }
//         },
//         '/files': {
//             '/add': {
//                 post: 'files.files.add'
//             },
//             '/upload': {
//                 post: 'files.files.upload'
//             },
//             '/:id': {
//                 put: 'files.files.update',
//                 delete: 'files.files.delete',
//             },
//             '/lists': {
//                 get: 'files.files.lists'
//             },
//             '/type': {
//                 '/add': {
//                     post: 'files.type.add'
//                 },
//                 '/:id': {
//                     put: 'files.type.update',
//                     delete: 'files.type.delete'
//                 },
//                 '/lists': {
//                     get: 'files.type.lists'
//                 },
//                 '/treeList': {
//                     get: 'files.type.treelist'
//                 }
//             }
//         },
//         '/act': {
//             '/components': {
//                 '/add': {
//                     post: 'act.components.add'
//                 },
//                 '/lists': {
//                     get: 'act.components.lists'
//                 },
//                 '/update': {
//                     post: 'act.components.update'
//                 },
//                 '/:name': {
//                     delete: 'act.components.delete'
//                 }
//             },
//             '/upload': {
//                 post: 'act.act.upload'
//             },
//             '/draft': {
//                 post: 'act.act.draft'
//             },
//             '/publish': {
//                 post: 'act.act.publish'
//             },
//             '/lists': {
//                 get: 'act.act.lists'
//             },
//             '/:id': {
//                 get: 'act.act.one',
//                 post: 'act.act.online',
//                 put: 'act.act.offline',
//                 delete: 'act.act.delete'
//             },
//             '/tpl': {
//                 '/add': {
//                     post: 'act.tpl.add'
//                 },
//                 '/update': {
//                     post: 'act.tpl.update'
//                 },
//                 '/lists': {
//                     get: 'act.tpl.lists'
//                 },
//                 '/:id': {
//                     get: 'act.tpl.one',
//                     put: 'act.tpl.updateInfor',
//                     delete: 'act.tpl.delete'
//                 }
//             },
//             '/config': {
//                 '/add': {
//                     post: 'act.config.add'
//                 },
//                 '/lists': {
//                     get: 'act.config.lists'
//                 },
//                 '/:id': {
//                     put: 'act.config.update',
//                     delete: 'act.config.delete'
//                 }
//             }
//         },
//         '/operate': {
//             '/lists': {
//                 get: 'operate.loan.lists'
//             },
//             '/add': {
//                 post: 'operate.loan.add'
//             },
//             '/upload': {
//                 post: 'operate.loan.upload'
//             },
//             '/save': {
//                 post: 'operate.loan.save'
//             },
//             '/:id': {
//                 put: 'operate.loan.sort',
//                 post: 'operate.loan.updatestatus',
//                 get: 'operate.loan.one'
//             },
//             '/update/:id': {
//                 put: 'operate.loan.update'
//             }
//         }
//     },
//     // backend 站点页面
//     '/preview': {
//         '/news': {
//             '/home': {
//                 get: 'news.news.previewHome'
//             },
//             '/:id': {
//                 get: 'news.news.previewHetrone'
//             },
//         },
//         '/contracts': {
//             '/:id': {
//                 get: 'contracts.contracts.preview'
//             },
//             // '/pdf/:id': {
//             //     get: 'contracts.contracts.previewpdf'
//             // },
//             '/history/:id': {
//                 get: 'contracts.history.preview'
//             }
//         },
//         // '/act': {
//         //     get: 'act.act.preview'
//         // },
//         // '/:type': {
//         //     get: 'news.news.newsLists'
//         // },
//         // '/:type/:ctype': {
//         //     get: 'news.news.newsLists'
//         // },
//         '/hetrone': {
//             '/previewnews/:id': {
//                 get: 'news.news.previewHetrone'
//             },
//             get: 'news.news.newsListsN'

//         },
//         '/apis': {
//             '/news/:id': {
//                 get: 'news.news.one'
//             },
//             '/:type': {
//                 get: 'news.news.onlineLists'
//             },
//             '/:type/:ctype': {
//                 get: 'news.news.onlineLists'
//             }
//         }
//     }
// }


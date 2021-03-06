module.exports = {
    '/api':{
        '/plugin':{
            '/blockRule':{
                get: 'plugin.block.rules',
                post: 'plugin.block.add',
                '/:id':{
                    put: 'plugin.block.update',
                    delete: 'plugin.block.delete'
                }
            },
            '/blockActive':{
                get: 'plugin.active.list',
                post: 'plugin.active.add',
                '/:id':{
                    put: 'plugin.active.update',
                    delete: 'plugin.active.delete'
                }
            },
            '/blockPay':{
                post:'plugin.active.pay'
            }
        },
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
            },
            '/:id':{
                put: 'sys.user.update',
                delete: 'sys.user.delete'
            }
        },
        '/config':{
            '/listByType':{
                get: 'sys.config.listByType'
            },
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
        '/act':{
            '/component':{
                get: 'act.component.list',
                post: 'act.component.upload',
                '/:name': {
                    delete: 'act.component.delete'
                }
            },
            '/upload': {
                post: 'act.act.upload'
            },
            '/draft': {
                post: 'act.act.draft'
            },
            '/online': {
                post: 'act.act.online'
            },
            '/offline':{
                post: 'act.act.offline'
            },
            get:'act.act.list',
            post: 'act.act.publish',
            '/:id': {
                get: 'act.act.one',
                delete: 'act.act.delete',
                patch: 'act.act.recover'
            }
        },
        '/contract':{
            '/type':{
                '/tree':{
                    get: 'contract.type.tree'
                },
                get: 'contract.type.list',
                post: 'contract.type.add',
                '/:id':{
                    put: 'contract.type.update',
                    delete: 'contract.type.delete'
                }
            },
            '/vm':{
                get: 'contract.vm.list',
                post: 'contract.vm.add',
                '/:id':{
                    put: 'contract.vm.update',
                    delete: 'contract.vm.delete'
                }
            },
            '/online':{
                post: 'contract.contract.online'
            },
            '/offline':{
                post: 'contract.contract.offline'
            },
            get: 'contract.contract.list',
            post: 'contract.contract.add',
            '/:id':{
                get: 'contract.contract.one',
                put: 'contract.contract.update',
                delete: 'contract.contract.delete'
            }
        },
        '/pro':{
          '/type':{
              '/tree':{
                  get: 'product.type.tree'
              },
              get: 'product.type.list',
              post: 'product.type.add',
              '/:id':{
                  put: 'product.type.update',
                  delete: 'product.type.delete'
              }
          },
          '/online':{
              post: 'product.product.online'
          },
          '/offline':{
              post: 'product.product.offline'
          },
          '/upload': {
              post: 'product.product.upload'
          },
          get: 'product.product.list',
          post: 'product.product.add',
          '/:id':{
              get: 'product.product.one',
              put: 'product.product.update',
              delete: 'product.product.delete'
          }
        },

        '/qizhi':{
          '/student':{
            get:'qizhi.student.list',
            post:'qizhi.student.add',
            '/:id':{
              put:'qizhi.student.update',
              delete:'qizhi.student.delete'
            }
          },
          '/user':{
              get:'qizhi.user.list',
              post:'qizhi.user.add',
              '/:id':{
                  put:'qizhi.user.update',
                  delete:'qizhi.user.delete'
              }
          },
          '/study':{
            get: 'qizhi.study.list'
          }
        },
        '/yz':{
            '/banner':{
                get:'youzhu.banner.list',
                post:'youzhu.banner.add',
                '/upload':{
                    post:'youzhu.banner.upload'
                },
                '/:id':{
                    put:'youzhu.banner.update',
                    delete:'youzhu.banner.delete',
                }
            },
        },
        
        '/demo':{
            '/user':{
                post:'demo.user.add'
            }
        }
    },
    '/plugin':{
        '/block':{
            get: 'plugin.block.one',
            post: 'plugin.block.one'
        },
        '/active':{
            post:'plugin.active.active'
        },
        '/status':{
            post: 'plugin.active.one'
        }
    },

    '/qizhi':{
      '/user':{
        '/signIn':{ 
          post:'qizhi.user.signIn'
        }
      },
      '/study':{
        '/checkIn':{
          post: 'qizhi.study.checkIn'
        }
      }
    }
}

/// <reference types="cypress"/>

describe('Should test at a functional level', () => {

    let token

    before(() => {
        cy.getToken('a@a', 'a')     // esta é uma promisse, por isso não da para associar com variavel
            .then(tkn => {
                token = tkn
            })
    })

    beforeEach(() => {
        cy.resetRest()
    })

    it('Should create a account', () => {
        cy.request({
            url: '/contas',     // em cypress.json -> "baseUrl": "https://barrigarest.wcaquino.me"
            method: 'POST',
            headers: {
                Authorization: `JWT ${token}`           // JWT estrategia de autenticação - atualmente bearer
            },
            body: {
                nome: 'Conta via rest'
            }
        }).as('response')                               // .then(res => console.log(res))
        cy.get('@response').then(res => {
            expect(res.status).to.be.equal(201)
            expect(res.body).to.have.property('id')
            expect(res.body).to.have.property('nome', 'Conta via rest')
        })
    })

    it('Should update an account', () => {
            cy.getContaByName('Conta para alterar')
            .then(contaId => {
                cy.request({
                    url: `/contas/${contaId}`,
                    method: 'PUT',
                    headers: { Authorization: `JWT ${token}` },
                    body: { nome: 'Conta alterada via rest' }
                }).as('response')
            })
         cy.get('@response').its('status').should('be.equal', 200)
    })

    it('Should not creat an account with same name', () => {
        cy.request({
            url: '/contas',     // em cypress.json -> "baseUrl": "https://barrigarest.wcaquino.me"
            method: 'POST',
            headers: {
                Authorization: `JWT ${token}`           // JWT estrategia de autenticação - atualmente bearer
            },
            body: {
                nome: 'Conta mesmo nome'
            }, failOnStatusCode: false
        }).as('response')                               // .then(res => console.log(res))
        cy.get('@response').then(res => {
            expect(res.status).to.be.equal(400)
            // expect(res.body).to.have.property('error', 'Já existe uma conta com esse nome!') -> outro modo
            expect(res.body.error).to.be.equal('Já existe uma conta com esse nome!')
        })
    })

    it('Should create a transaction', () => {
        cy.getContaByName('Conta para movimentacoes')
            .then(contaId => {
                cy.request({
                    method: 'POST',
                    url: '/transacoes',
                    headers: {
                        Authorization: `JWT ${token}`           // JWT estrategia de autenticação - atualmente bearer
                    },
                    body: {
                        conta_id: contaId,
                        data_pagamento: Cypress.moment().add({ days: 1 }).format('DD/MM/YYYY'),
                        data_transacao: Cypress.moment().format('DD/MM/YYYY'),
                        descricao: 'desc',
                        envolvido: 'inter',
                        status: true,
                        tipo: 'REC',
                        valor: '123'
                    }
                }).as('response')       // alias
            })
        cy.get('@response').its('status').should('be.equal', 201)   // its reduziu a resposta para 'status'
        cy.get('@response').its('body.id').should('exist')
    })

    it('Should get balance', () => {
        cy.request({
            url: '/saldo',
            method: 'GET',
            headers: {
                Authorization: `JWT ${token}`           // JWT estrategia de autenticação - atualmente bearer
            },
        }).then(res => {
            // console.log(res)
            let saldoConta = null
            res.body.forEach(c => {
                if (c.conta === 'Conta para saldo') saldoConta = c.saldo
            })
            expect(saldoConta).to.be.equal('534.00')
        })

        cy.request({
            method: 'GET',
            url: '/transacoes',
            headers: {
                Authorization: `JWT ${token}`           // JWT estrategia de autenticação - atualmente bearer
            },
            qs: { descricao: 'Movimentacao 1, calculo saldo' }
        }).then(res => {
            cy.request({
                url: `/transacoes/${res.body[0].id}`,
                method: 'PUT',
                headers: {
                    Authorization: `JWT ${token}`           // JWT estrategia de autenticação - atualmente bearer
                },
                body: {
                    status: true,
                    data_transacao: Cypress.moment(res.body[0].data_transacao).format('DD/MM/YYYY'),
                    data_pagamento: Cypress.moment(res.body[0].data_pagamento).format('DD/MM/YYYY'),
                    descricao: res.body[0].descricao,
                    envolvido: res.body[0].envolvido,
                    valor: res.body[0].valor,
                    conta_id: res.body[0].conta_id
                }
            }).its('status').should('be.equal', 200)
        })

        cy.request({
            url: '/saldo',
            method: 'GET',
            headers: {
                Authorization: `JWT ${token}`           // JWT estrategia de autenticação - atualmente bearer
            },
        }).then(res => {
            // console.log(res)
            let saldoConta = null
            res.body.forEach(c => {
                if (c.conta === 'Conta para saldo') saldoConta = c.saldo
            })
            expect(saldoConta).to.be.equal('4034.00')
        })
    })

    it('Should remove a transaction', () => {
        cy.request({
            method: 'GET',
            url: '/transacoes',
            headers: { Authorization: `JWT ${token}` },
            qs: { descricao: 'Movimentacao para exclusao' }
        }).then(res => {
            cy.request({
                url: `/transacoes/${res.body[0].id}`,
                method: 'DELETE',
                headers: { Authorization: `JWT ${token}` },
            }).its('status').should('be.equal', 204)
        })
    })
})
/// <reference types="cypress"/>

describe('Should test at a functional level', () => {

    let token

    before(() => {
    })

    beforeEach(() => {
     })

    it('Should create a account', () => {
        cy.request({
            method: 'POST',
            url: 'https://barrigarest.wcaquino.me/signin',
            body:{
                email: 'a@a',
                redirecionar: false,
                senha: 'a'
            }
        }).its('body.token').should('not.be.empty')
            .then(token => {
                cy.request({
                    url: 'https://barrigarest.wcaquino.me/contas',
                    method: 'POST',
                    headers: {Authorization:  `JWT ${token}`},  // Authorization:  `bearer ${token}`},
                    body: {
                        nome: 'Conta via rest'
                    }
                // }).then(res => console.log(res))
                }).as('response')
            })
        cy.get('@response').then(res => {           // poderia ser no lugar do .as acima
            expect(res.status).to.be.equal(201)
            expect(res.body).to.have.property('id')
        })
    })

    it('Should update an account', () => {
    })

    it('Should not creat an account with same name', () => {
    })

    it('Should create a transaction', () => {
    })

    it('Should get balance', () => {
    })

    it('Should remove a transaction', () => {
    })
})
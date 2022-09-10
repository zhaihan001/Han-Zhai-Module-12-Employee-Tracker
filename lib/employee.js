class Employee{
    constructor(id, first_name, last_name, role_id, manager_id){
        this.id = 'id';
        this.first_name = first_name;
        this.last_name = last_name;
        this.role_id = role_id;
        this.manager_id = manager_id;
    }
    getId(){
        return this.id;
    }
    getFn(){
        return this.first_name;
    }
    getLn(){
        return this.last_name;
    }
    getRoleId(){
        return this.role_id;
    }
    getManagerId(){
        return this.manager_id;
    }
}

module.exports = Employee;
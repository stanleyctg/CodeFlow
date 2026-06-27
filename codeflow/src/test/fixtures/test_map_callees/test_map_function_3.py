class Order:
    def process_order(self):
        if (self.validate_order()):
            return 'processing order'
        return 'broken'
    
    def complete_order(self):
        self.save_order()
        return 'order has been saved'

    def save_order(self):
        return 'saving order'
    
    def validate_order(self):
        return 'validating order'
